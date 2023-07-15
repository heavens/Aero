use serde::Deserialize;

/// A task to be executed by the server runtime.
pub trait Task: Send {
    type JsValue: for<'de> Deserialize<'de>;
}