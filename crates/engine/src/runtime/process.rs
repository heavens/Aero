use std::{
    io::{self},
    process::{self, Child, ChildStdin, ChildStdout, Stdio},
};

use crate::error::AeroError;

pub struct Process {
    pub child: Option<Child>,
}

impl Process {
    /// Spawns a new process using the passed-in arguments, if any.
    pub fn spawn(cmd: impl AsRef<str>, args: &[&str]) -> Result<Child, io::Error> {
        let spawned_child = process::Command::new(cmd.as_ref())
            .args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .spawn()?;
        Ok(spawned_child)
    }

    /// Attempts to obtain a stdin/stdout pair from the spawned process, returning an error if unsuccessful.
    pub fn stdio(&mut self) -> Result<(Option<ChildStdin>, Option<ChildStdout>), AeroError> {
        if let Some(process) = self.child.as_mut() {
            let stdin = process.stdin.take();
            let stdout = process.stdout.take();
            return Ok((stdin, stdout));
        }

        Err(AeroError::Other(
            "failed to obtain stdio from child process.".into(),
        ))
    }

    /// Waits for the spawned process to finish execution.
    pub fn wait(mut self) {
        if let Some(mut child) = self.child.take() {
            if let Err(e) = child.wait() {
                log::error!("child process did not exit gracefully: {:?}", e);
            }
        }
    }
}
