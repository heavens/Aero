use std::{default, thread, time::Duration};

use crate::queue::MessageQueue;

pub mod process;
pub mod threading;

/// Defines the execution behavior of an [EventLoop].
#[derive(Debug, Default)]
pub enum ControlFlow {
    #[default]
    Await,
    Delay(Duration),
    Polling,
    Exit,
}

impl ControlFlow {
    pub fn exiting(&self) -> bool {
        matches!(self, ControlFlow::Exit)
    }
}

pub struct EventLoop<T> {
    flow: ControlFlow,
    message_queue: MessageQueue<T>,
}

impl<T> EventLoop<T> {
    /// Constructs a new event loop to be used within the server process. The event loop starts in the [ControlFlow::Await] state
    /// until signaled otherwise.
    pub fn new() -> Self {
        Self {
            flow: ControlFlow::default(),
            message_queue: MessageQueue::fixed(64),
        }
    }

    /// Runs the event loop to completion, using the passed-in `func` closure as the logic to be executed when polling.
    pub fn run(mut self, mut func: impl FnMut(T) -> ControlFlow) {
        while !self.flow.exiting() {
            let next = self.message_queue.incoming();
            if let Ok(next) = next {
                self.flow = func(next);
            }
            thread::sleep(Duration::from_millis(20));
        }

        log::info!("Exiting event loop.");
    }
}
