use wry::application::event_loop::{EventLoop, EventLoopProxy};
use aero_engine::{event::AeroEvent, window::AeroWindow};

pub struct AeroContext {
    window: AeroWindow,
    event_loop: EventLoopProxy<AeroEvent>,
}

impl AeroContext {
    pub fn new(event_loop: &EventLoop<AeroEvent>) -> Self {
        Self {
            window: AeroWindow::new(),
            event_loop: event_loop.create_proxy(),
        }
    }

    pub fn send(&self, event: AeroEvent) {
        self.event_loop
            .send_event(event)
            .expect("failed sending AeroEvent");
    }

    pub fn window(&self) -> &AeroWindow {
        &self.window
    }
}
