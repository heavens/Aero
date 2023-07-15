use std::str::FromStr;

use crate::error::AeroError;

/// A wrapper which encapsulates a protocol, host and port value. While a process may not necessarily require an active networking
/// connection to listen on, for example socket events, it still may be advantageous to have governance over the 
/// address being "bound" to within a LAN context.
#[derive(Debug)]
pub struct Domain {
    protocol: String,
    host: String,
    port: usize,
}

impl Domain {
    /// Constructs a new [Domain] with the protocol being set to passed-in `name` value.
    pub fn with_protocol(name: impl AsRef<str>) -> Self {
        Self {
            protocol: name.as_ref().into(),
            ..Default::default()
        }
    }

    /// Verifies if this domain has authority over the connection requesting access, if applicable. Currently, we take a naive
    /// approach towards determining authority by only checking if the protocols match up. If the requesting connection has the same
    /// protocol then we consider the owner of this domain to have authority over it. **This should not be applied to any public-facing network as it
    /// is a blatant security risk.**
    pub fn has_authority(&self, addr: impl AsRef<str>) -> bool {
        let incoming: Vec<String> = addr.as_ref().split(":").map(str::to_owned).collect();
        self.protocol == incoming[0]
    }
}

impl Default for Domain {
    fn default() -> Self {
        Self {
            protocol: Default::default(),
            host: "localhost".into(),
            port: 3000,
        }
    }
}

impl ToString for Domain {
    fn to_string(&self) -> String {
        format!("{}://{}:{}", self.protocol, self.host, self.port)
    }
}

impl FromStr for Domain {
    type Err = AeroError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let parts: Vec<String> = s.split(":").map(str::to_owned).collect();
        if parts.len() < 3 {
            return Err(AeroError::DomainFormat(
                "domain must contain a protocol, host and port".into(),
            ));
        }
        Ok(Self {
            protocol: parts[0].clone().into(),
            host: parts[1][2..].into(),
            port: parts[2]
                .parse::<usize>()
                .map_err(|err| AeroError::DomainFormat(err.to_string()))
                .unwrap_or_default(),
        })
    }
}
