use io::Receiver;
use io::Sender;
use serde::Deserialize;
use serde::Serialize;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use wasm_bindgen::prelude::*;
use zephyr_shared::error::ZephyrError;
use zephyr_shared::rt::Task;
use zephyr_shared::ViewId;

mod connection;
mod io;
mod logger;
mod message;
mod stream;

#[derive(Serialize, Debug)]
pub enum OutgoingMessage {}

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
pub enum IncomingMessage {
    Action { view_id: ViewId, action: Value },
}

#[derive(Clone)]
pub struct RuntimeExecutor {
    state: Arc<Mutex<ExecutorState>>,
}

pub struct ExecutorState {
    next_task_id: usize,
    active_tasks: HashMap<usize, Task<()>>,
}

impl ExecutorState {
    /// Pushes a task into the collection of active tasks, incrementing the `next_task_id` counter by 1.
    pub fn push_task(&mut self, task: Task<()>) {
        let task_id = self.next_task_id;
        self.active_tasks.insert(task_id, task);
        self.next_task_id += 1;
    }
}

#[wasm_bindgen]
pub struct ZephyrServer {
    executor: RuntimeExecutor,
}

impl RuntimeExecutor {
    fn new() -> Self {
        Self {
            state: Arc::new(Mutex::new(ExecutorState {
                next_task_id: 0,
                active_tasks: HashMap::new(),
            })),
        }
    }

    /// Invokes the specified closure `func` synchronously, blocking the current thread until completion.
    pub fn with_sync_state(&self, func: impl Fn(&mut ExecutorState)) -> Result<(), ZephyrError> {
        {
            let mut guard = self
                .state
                .lock()
                .map_err(|err| ZephyrError::Other(err.to_string()))?;
            (func)(&mut guard);
        }
        Ok(())
    }
}

#[wasm_bindgen]
impl ZephyrServer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        ZephyrServer {
            executor: RuntimeExecutor::new(),
        }
    }
}
