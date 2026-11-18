use serde::{Serialize, Deserialize};

#[derive(Debug, Deserialize, Serialize)]
pub enum AeroEvent {
    Notification(Notification),
    Request(Request)
} 

#[derive(Deserialize, Debug, Serialize)]
pub enum Notification {
    Initialized {
        window_id: usize,
    },
    Error
}

#[derive(Deserialize, Debug, Serialize)]
#[serde(tag = "type")]
pub enum Request {
    Initialize {
        uri: String,
        path: Option<String>
    },
    CloseWindow
}