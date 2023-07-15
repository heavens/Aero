use std::task::Poll;
use async_channel::{Receiver, Sender};
use futures_lite::Stream;

use crate::error::AeroError;

pub struct MessageQueue<T> {
    receiver: Receiver<T>,
    sender: Sender<T>
}

impl<T> MessageQueue<T> {
    
    pub fn fixed(capacity: usize) -> Self {
        let (sender, receiver) = async_channel::bounded(capacity);
        Self {
            receiver,
            sender
        }
    }
    
    pub fn incoming(&self) -> Result<T, AeroError> {
        self.receiver.try_recv().map_err(|err| AeroError::Rpc(err.to_string()))
    }

    pub fn send_outgoing(&self, message: T) -> Result<(), AeroError> {
        self.sender.try_send(message).map_err(|err| AeroError::Rpc(err.to_string()))
    }
}

impl<T> Stream for MessageQueue<T> {
    type Item = Result<T, AeroError>;
    
    fn poll_next(self: std::pin::Pin<&mut Self>, _cx: &mut std::task::Context<'_>) -> Poll<Option<Self::Item>> {
        if self.receiver.is_empty() {
            return Poll::Pending
        }

        if self.receiver.is_closed() {
            return Poll::Ready(Some(Err(AeroError::Rpc("cannot poll message queue once its been closed.".into()))))
        }
        
        match self.receiver.try_recv() {
            Ok(next) => Poll::Ready(Some(Ok(next))),
            Err(e) => Poll::Ready(Some(Err(AeroError::Rpc(e.to_string()))))
        }
    }
}