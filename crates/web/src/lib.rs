use aero_engine::{
    event::{AeroEvent, Notification, Request},
    window::WindowId,
};
use js_sys::Promise;
use std::fmt::Debug;
use wasm_bindgen::prelude::*;


#[wasm_bindgen]
pub struct AeroServer {
    running: bool,
}

#[wasm_bindgen]
impl AeroServer {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self { running: false }
    }

    #[wasm_bindgen]
    pub fn initialize(&mut self, request: &JsValue) -> Promise {
        if self.running {
            log::warn!("caught attempt to re-spawn an active server process.");
            return Promise::reject(&JsValue::null());
        }

        self.running = true;
        let decoded = serde_wasm_bindgen::from_value(request.clone());
        if let Err(e) = decoded {
            return Promise::reject(&JsValue::from_str(&e.to_string()));
        }

        let decoded: Request = decoded.unwrap();
        let decoded_str = format!("got init request: {:?}", decoded);
        log4wasm::info!(decoded_str);

        let window_id = WindowId::new();
        Promise::resolve(
            &serde_wasm_bindgen::to_value(&Notification::Initialized {
                window_id: *window_id,
            })
            .unwrap_or_else(|_| JsValue::null()),
        )
    }

    #[wasm_bindgen(js_name = onMessage)]
    pub fn on_message(&self, msg: JsValue) {
        let decoded = serde_wasm_bindgen::from_value(msg)
            .unwrap_or(AeroEvent::Notification(Notification::Error));
        let fmt = format!("received msg {:?}", decoded);
        log4wasm::info!(fmt);
    }
}

impl Drop for AeroServer {
    fn drop(&mut self) {
        self.running = false;
    }
}

impl Debug for AeroServer {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ServerService").finish()
    }
}
