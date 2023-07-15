use std::thread::{self, JoinHandle};

/// A factory for conveniently creating a thread, or thread pool, to be used within the active runtime.
pub struct ThreadFactory(thread::Builder);

impl ThreadFactory {

    /// Constructs a new factory for building one or more threads.
    pub fn builder() -> Self {
        ThreadFactory(thread::Builder::new())
    }

    /// Sets a name to be given by the thread(s) built from this factory instance.
    pub fn named(mut self, name: impl AsRef<str>) -> Self {
        self.0 = self.0.name(name.as_ref().into());
        self
    }

    /// Finalizes the building operation, forwarding the passed-in closure to be ran within the spawned thread as the event loop. The
    /// event loop will be ran by the thread to completion, after which the thread will be dropped. Any remaining resources will be
    /// diposed by the runtime as a garbage collection mechanism.
    pub fn spawn_single_thread(self, event_loop: impl FnOnce() + Send + 'static) -> JoinHandle<()> {
        self.0.spawn(event_loop).expect("spawning single thread from factory")
    }
}