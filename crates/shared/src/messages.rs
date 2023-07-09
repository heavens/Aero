use serde::{Deserialize, Serialize};

use self::window::WindowMessage;

pub mod window;

/// A message sent from the renderer process to the main process. An action is analogous to a client -> server in
/// networking architecture such that the client is requesting some change to be applied in which the **server should first verify** the
/// validity of the request before applying the relative changes.
#[derive(Clone, Debug, Deserialize)]
pub enum Action {
    Window(WindowMessage)
}

/// A message sent from the main process to the renderer process. A command is analogous to a server -> client packet in 
/// networking architecture such that the server is "eliciting" some behavior or effect from the client.
#[derive(Clone, Debug, Serialize)]
pub enum Command {

}