use std::net::{ToSocketAddrs, TcpStream};

use crate::{Receiver, Sender};
use futures::channel;
use zephyr_shared::error::ZephyrError;

pub struct Connection {
    rx: Receiver,
    tx: Sender
}

impl Connection {

    /// Initializes an unbounded, piped connection used for IPC. 
    pub fn piped() -> Self {
        let (tx, rx) = unbounded_channel();
        Self { tx, rx }
    }

    /// Attempts to establish a new connection, over TCP, to the targeted host.
    pub fn tcp(addr: impl ToSocketAddrs) -> Result<Self, ZephyrError> {
        let _socket = TcpStream::connect(addr).map_err(ZephyrError::TcpConnection)?;
        let (tx, rx) = unbounded_channel();
        Ok(Self { rx, tx })
    }
}

/// Convenience function for creating an unbounded channel where each halve is intended to be used for IPC over a stdio-driven connection.
fn unbounded_channel() -> (Sender, Receiver) {
    let (tx, rx) = channel::mpsc::unbounded();
    (Sender(Some(tx)), Receiver(rx))
}