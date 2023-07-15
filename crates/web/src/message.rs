
use std::task::Poll;

use futures::Stream;
use js_sys::Promise;
use wasm_bindgen::{JsValue, prelude::wasm_bindgen};

pub trait IntoDeserialzable: for<'de> serde::Deserialize<'de> {
    fn into_value(self) -> JsValue;
}

#[wasm_bindgen(module = "js/api.ts")]
extern "C" {
    pub type StreamReader;

    fn next(this: &StreamReader) -> Promise;
}

impl Stream for StreamReader {
    type Item = JsValue;

    fn poll_next(self: std::pin::Pin<&mut Self>, _cx: &mut std::task::Context<'_>) -> Poll<Option<Self::Item>> {
        Poll::Pending
    }
}