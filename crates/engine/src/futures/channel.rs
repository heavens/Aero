

use crate::error::AeroError;

pub struct Channel<T> {
    receiver: Receiver<T>,
    sender: Sender<T>,
}

impl<T> Channel<T> {
    pub fn unbounded() -> (Sender<T>, Receiver<T>) {
        let (sender, receiver) = async_channel::unbounded();
        (Sender { tx: sender }, Receiver { rx: receiver })
    }

    pub fn bounded(capacity: usize) -> (Sender<T>, Receiver<T>) {
        let (sender, receiver) = async_channel::bounded(capacity);
        (Sender { tx: sender }, Receiver { rx: receiver })
    }
}

pub struct Sender<T> {
    tx: async_channel::Sender<T>,
}

impl<T> Sender<T> {
    pub async fn send(&self, value: T) -> Result<(), AeroError> {
        self.tx.send(value).await.map_err(|err| AeroError::Rpc(err.to_string()))
    }
}

pub struct Receiver<T> {
    rx: async_channel::Receiver<T>,
}

impl<T> Receiver<T> {
    pub async fn recv(&self) -> Result<T, AeroError> {
        self.rx.recv().await.map_err(|err| AeroError::Rpc(err.to_string()))
    }
}
