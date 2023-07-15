use futures_lite::Future;
use std::{
    pin,
    task::{self, Poll},
    time::{Duration, SystemTime},
};

use crate::sync::waker::AtomicWaker;

/// A timer-like mechanism used mostly by internal apis. A ticker provides a minimalistic approach for
/// creating and measuring time-sensitive operations.
#[derive(Debug)]
pub struct Ticker {
    ticks: usize,
}

impl Ticker {
    pub fn new() -> Self {
        Self { ticks: 0 }
    }

    pub fn increment(&mut self) {
        self.ticks += 1;
    }
}

/// A time-sensitive routine that completes at a specified time in the future.
pub struct Delay {
    cycles: u128,
    waker: AtomicWaker,
}

impl Delay {
    const DEFAULT_MS: usize = 200;

    pub fn temporal(time: SystemTime) -> Self {
        if time < SystemTime::now() {
            panic!("temporal value must be a valid time in the future.");
        }
        Self::until(SystemTime::now().duration_since(time).unwrap_or_else(|_| Duration::ZERO))
    }

    pub fn until(duration: Duration) -> Self {
        Self {
            waker: AtomicWaker::new(),
            cycles: (duration.as_millis() / Delay::DEFAULT_MS as u128),
        }
    }

    pub fn decrement(&mut self) {
        if self.cycles > 0 {
            self.cycles -= 1;
        }
    }

    pub fn is_finished(&self) -> bool {
        self.cycles == 0
    }
}

impl Future for Delay {
    type Output = ();

    fn poll(mut self: pin::Pin<&mut Self>, cx: &mut task::Context<'_>) -> Poll<Self::Output> {
        if self.cycles == 0 {
            return Poll::Ready(());
        }

        self.as_mut().decrement();
        self.waker.swap(cx.waker());

        if self.cycles == 0 {
            self.waker.wake();
            Poll::Ready(())
        } else {
            Poll::Pending
        }
    }
}
