

use thiserror::Error;

#[derive(Error, Debug)]
pub enum AeroError {
    #[error(transparent)]
    TcpConnection(std::io::Error),
    #[error("failed to process message: {0}")]
    Ipc(String),
    #[error("{0}")]
    Other(String),
}