use std::{
    cell::UnsafeCell,
    sync::atomic::{AtomicUsize, Ordering},
    task::Waker,
};

mod flags {
    // Waiting for a lock, no action being taken. Currently performs a spinlock-like behavior while waiting.
    pub(crate) const IDLE: usize = 0;
    // Obtaining a lock on the thread.
    pub(crate) const LOCKING: usize = 1 << 1;
    // Emitting a notification to any/all holders of a waker reference.
    pub(crate) const NOTIFYING: usize = 1 << 2;
}

/// A waker that performs operations atomically. A concurrency primitive useful for coordinating wakeups across threads.
#[derive(Default)]
pub struct AtomicWaker {
    state: AtomicUsize,
    waker: UnsafeCell<Option<Waker>>,
}

unsafe impl Send for AtomicWaker {}
unsafe impl Sync for AtomicWaker {}

impl AtomicWaker {
    pub const fn new() -> Self {
        trait AssertSync: Sync {}
        impl AssertSync for Waker {}

        Self {
            state: AtomicUsize::new(flags::IDLE),
            waker: UnsafeCell::new(None),
        }
    }

    /// Swaps the current waker, if any, with the passed-in waker.
    pub fn swap(&self, waker: &Waker) {
        match self
            .state
            .compare_exchange(
                flags::IDLE,
                flags::LOCKING,
                Ordering::Acquire,
                Ordering::Acquire,
            )
            .unwrap_or_else(|x| x)
        {
            flags::IDLE => unsafe {
                if let Some(prev_waker) = &*self.waker.get() {
                    if !prev_waker.will_wake(waker) {
                        *self.waker.get() = Some(waker.clone());
                    }
                }

                match self.state.compare_exchange(
                    flags::LOCKING,
                    flags::IDLE,
                    Ordering::AcqRel,
                    Ordering::Acquire,
                ) {
                    Ok(_) => {}
                    Err(state) => {
                        // State must have a lock on the current thread AND be in the notifying position.
                        if state & (flags::LOCKING | flags::NOTIFYING) == 0 {
                            return;
                        }

                        // Assume optimistically that the waker is a valid value at this point. If a panic occurs here then it 
                        // is the result of some race overlooked.
                        let waker = (*self.waker.get()).take().unwrap();
                        self.state.swap(flags::IDLE, Ordering::AcqRel);
                        waker.wake();
                    }
                }
            },
            flags::NOTIFYING => waker.wake_by_ref(),
            _state => {}
        }
    }

    pub fn wake(&self) {
        if let Some(waker) = self.take() {
            waker.wake();
        }
    }

    fn take(&self) -> Option<Waker> {
        match self.state.fetch_or(flags::NOTIFYING, Ordering::AcqRel) {
            flags::IDLE => unsafe {
                let waker = (*self.waker.get()).take();
                self.state.fetch_and(!flags::NOTIFYING, Ordering::AcqRel);
                waker
            },
            _state => None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::AtomicWaker;
    use futures_lite::Future;
    use std::{
        sync::{
            atomic::{AtomicBool, Ordering},
            Arc,
        },
        task::Poll,
        thread,
        time::Duration,
    };

    #[test]
    fn test_wakeup() {
        #[derive(Default)]
        struct SharedState {
            waker: AtomicWaker,
            completed: AtomicBool,
        }

        impl SharedState {
            pub fn is_complete(&self) -> bool {
                self.completed.load(Ordering::Relaxed)
            }
        }

        #[derive(Clone)]
        struct Flag(Arc<SharedState>);

        impl Flag {
            fn notify(&self) {
                self.0.completed.store(true, Ordering::Relaxed);
                self.0.waker.wake();
            }
        }

        impl Future for Flag {
            type Output = ();

            fn poll(
                self: std::pin::Pin<&mut Self>,
                cx: &mut std::task::Context<'_>,
            ) -> std::task::Poll<Self::Output> {
                println!("polling flag...");
                if self.0.is_complete() {
                    return Poll::Ready(());
                }

                self.0.waker.swap(cx.waker());
                if self.0.is_complete() {
                    Poll::Ready(())
                } else {
                    Poll::Pending
                }
            }
        }

        let flag = Flag(Arc::new(SharedState::default()));
        let shared = flag.clone();
        let thread_2 = thread::Builder::new()
            .name("test-wakeup".into())
            .spawn(move || {
                println!("starting thread-2. waiting on notify...");
                println!("spin lock waiting to complete...");
                futures_lite::future::block_on(async {
                    while !shared.0.is_complete() {
                        futures_lite::future::yield_now().await;
                    }
                })
            })
            .unwrap();

        println!("thread-1 sleeping for 2 seconds...");
        thread::sleep(Duration::from_millis(10));
        println!("thread-1 notifying thread-2...");
        flag.notify();
        println!("thread-1 finished.");
        thread_2.join().expect("joining thread-2");
        println!("thread-2 finished.");
    }
}
