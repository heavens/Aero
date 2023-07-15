use std::{
    ops::Deref,
    sync::{
        atomic::{AtomicUsize, Ordering},
        Arc, Mutex,
    },
};

use serde::{Deserialize, Serialize};

/// A unique identifier for a window instance. New window ids can be constructed through invocations of the designated `new`
/// constructor, however direct use is discouraged as it is used internally as needed.
#[derive(Debug, Serialize, Deserialize)]
pub struct WindowId(usize);

impl WindowId {
    /// Constructs a new window id, using the default global provider, incrementing the counter by 1.
    pub fn new() -> Self {
        static ID_PROVIDER: AtomicUsize = AtomicUsize::new(1);
        WindowId(ID_PROVIDER.fetch_add(1, Ordering::SeqCst))
    }
}

impl Deref for WindowId {
    type Target = usize;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

/// A window handle to that may be cloned and shared as needed. A handle is cheap to clone as it merely holds a reference
/// to its state.
#[derive(Debug)]
pub struct AeroWindow(Arc<Mutex<WindowCtx>>);

impl AeroWindow {
    pub fn new() -> Self {
        Self(Arc::new(Mutex::new(WindowCtx::default())))
    }

    pub fn clone(&self) -> Arc<Mutex<WindowCtx>> {
        self.0.clone()
    }

    pub fn width(&self) -> f64 {
        self.0
            .lock()
            .and_then(|ctx| Ok(ctx.width))
            .unwrap_or_default()
    }

    pub fn height(&self) -> f64 {
        self.0
            .lock()
            .and_then(|ctx| Ok(ctx.height))
            .unwrap_or_default()
    }
}

#[derive(Debug)]
pub struct WindowCtx {
    id: WindowId,
    width: f64,
    height: f64,
}

impl WindowCtx {
    
}

impl Default for WindowCtx {
    fn default() -> Self {
        Self {
            id: WindowId::new(),
            width: 800.0f64,
            height: 650.0f64,
        }
    }
}
