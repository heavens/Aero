

use thiserror::Error;

#[derive(Error, Debug)]
pub enum ZephyrError {
    #[error(transparent)]
    TcpConnection(std::io::Error),
    #[error("{0}")]
    Other(String),
}