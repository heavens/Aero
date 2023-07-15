use aero_engine::event::{AeroEvent, Request as AeroRequest};
use app::AeroContext;
use wry::{
    application::{
        dpi::PhysicalSize,
        event::{Event, StartCause, WindowEvent},
        event_loop::{ControlFlow, EventLoop},
        menu::MenuBar,
        window::WindowBuilder,
    },
    webview::WebViewBuilder,
};

mod app;
mod utils;

const PROTOCOL: &'static str = "aero";

const APP_NAME: &'static str = "Aero";

fn main() -> wry::Result<()> {
    const HOST: Option<&str> = option_env!("AERO_HOST");
    const PORT: Option<&str> = option_env!("AERO_PORT");
    const CHANNEL: Option<&str> = option_env!("AERO_CHANNEL");

    // Construct our event loop.
    let event_loop: EventLoop<AeroEvent> = EventLoop::with_user_event();

    // The window struct for Aero.
    let aero = AeroContext::new(&event_loop);
    let window = WindowBuilder::new()
        .with_inner_size(PhysicalSize::new(
            aero.window().width(),
            aero.window().height(),
        ))
        .with_min_inner_size(PhysicalSize::new(
            aero.window().width(),
            aero.window().height(),
        ))
        .with_menu(MenuBar::new())
        .with_decorations(false)
        .with_title(APP_NAME)
        .with_closable(true)
        .build(&event_loop)?;

    let host = HOST.unwrap_or_else(|| "localhost");
    let port = PORT.unwrap_or_else(|| "8080");
    let address = format!("http://{}.{}:{}/", PROTOCOL, host, port);
    let on_dev_channel = CHANNEL.unwrap_or_else(|| "development") == "development";

    // Build the webview. A naive approach currently, but it works for now.
    let _webview = WebViewBuilder::new(window)?
        .with_custom_protocol(PROTOCOL.into(), utils::handle_req)
        .with_url(&address)?
        .with_accept_first_mouse(true)
        .with_navigation_handler(|s| {
            log::info!("{}", s);
            true
        })
        .with_ipc_handler(move |window, req| {
            if req == "window_drag" {
                let _ = window.drag_window();
            } else if req == "window_minimize" {
                window.set_minimized(true);
            } else if req == "window_close" {
                aero.send(AeroEvent::Request(AeroRequest::CloseWindow));
            }
        })
        .with_devtools(on_dev_channel)
        .build()?;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::NewEvents(StartCause::Init) => {}
            Event::WindowEvent {
                window_id: _,
                event: window_event,
                ..
            } => match window_event {
                WindowEvent::CloseRequested => {
                    *control_flow = ControlFlow::Exit;
                }
                _ => log::debug!("unhandled window_event: {:?}", window_event),
            },
            Event::UserEvent(aero_event) => match aero_event {
                AeroEvent::Notification(notification) => {
                    log::info!("Notification {:?}", notification);
                }
                AeroEvent::Request(request) => {
                    log::info!("Request {:?}", request);
                    if let AeroRequest::CloseWindow = request {
                        *control_flow = ControlFlow::Exit;
                    }
                }
            },
            _ => {
                log::info!("unhandled event");
            }
        }
    });
}
