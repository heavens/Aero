use crate::{IncomingMessage, OutgoingMessage};

#[derive(Debug)]
pub enum Message {
    Incoming(IncomingMessage),
    OutgoingMessage(OutgoingMessage)
}