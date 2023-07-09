use std::marker::PhantomData;

use serde::Deserialize;
use wry::application::window::Window;
use zephyr_shared::{messages::{Action, window::WindowMessage}, error::AeroError};

#[derive(Debug)]
pub struct Ipc<'ipc, T> {
    marker: PhantomData<&'ipc T>
}

impl<'ipc, T> Ipc<'ipc, T> where T: Deserialize<'ipc> {

    pub fn new() -> Self {
        Self {
            marker: PhantomData
        }
    }

    pub fn process_message(&self, window: &Window, event_name: String) {
        let Ok(event) = serde_json::from_str(&event_name).map_err(|err| AeroError::Ipc(err.to_string())) else {
            panic!("unknown message: {}", event_name);
        };
        match event {
            Action::Window(window_action) => {
                if let WindowMessage::WindowDrag = window_action {
                    let _ = window.drag_window();
                }
            }
        }
        
    }
}