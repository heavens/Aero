

use thiserror::Error;

#[derive(Error, Debug)]
pub enum AeroError {
    #[error("malformed domain: {0}")]
    DomainFormat(String),
    #[error(transparent)]
    TcpConnection(std::io::Error),
    #[error("failed to process message: {0}")]
    Rpc(String),
    #[error("{0}")]
    Other(String),
}