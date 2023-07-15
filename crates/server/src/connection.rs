use aero_engine::futures::channel::{Channel, Receiver, Sender};
use async_net::TcpStream;

pub struct TcpConnection {
    socket: TcpStream,
    socket_rx: Receiver<Vec<u8>>,
    socket_tx: Sender<Vec<u8>>,
}

impl TcpConnection {
    pub fn new(socket: TcpStream) -> Self {
        let (socket_tx, socket_rx) = Channel::unbounded();
        Self { socket, socket_tx, socket_rx }
    }
}
