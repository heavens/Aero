use aero_engine::{event::AeroEvent, window::AeroWindow};
use tao::event_loop::{EventLoop, EventLoopProxy};

#[derive(Debug)]
pub enum UserEvent {
    Aero(AeroEvent),
    DragWindow,
    Minimize,
}

pub struct AeroContext {
    window: AeroWindow,
    proxy: EventLoopProxy<UserEvent>,
}

impl AeroContext {
    pub fn new(event_loop: &EventLoop<UserEvent>) -> Self {
        Self {
            window: AeroWindow::new(),
            proxy: event_loop.create_proxy(),
        }
    }

    pub fn proxy(&self) -> EventLoopProxy<UserEvent> {
        self.proxy.clone()
    }

    pub fn window(&self) -> &AeroWindow {
        &self.window
    }
}
