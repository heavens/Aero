use aero_engine::event::{AeroEvent, Request as AeroRequest};
use app::{AeroContext, UserEvent};
use tao::{
    dpi::PhysicalSize,
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoopBuilder},
    window::WindowBuilder,
};
use wry::WebViewBuilder;

mod app;
mod utils;

const PROTOCOL: &str = "aero";
const APP_NAME: &str = "Aero";

fn main() -> wry::Result<()> {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();

    let channel = std::env::var("AERO_CHANNEL").unwrap_or_else(|_| "development".into());
    let on_dev_channel = channel == "development";
    let url = if on_dev_channel {
        let host = std::env::var("AERO_HOST").unwrap_or_else(|_| "localhost".into());
        let port = std::env::var("AERO_PORT").unwrap_or_else(|_| "8080".into());
        format!("http://{host}:{port}/")
    } else {
        format!("{PROTOCOL}://localhost/index.html")
    };

    let event_loop = EventLoopBuilder::<UserEvent>::with_user_event().build();
    let aero = AeroContext::new(&event_loop);
    let size = PhysicalSize::new(aero.window().width(), aero.window().height());

    let window = WindowBuilder::new()
        .with_inner_size(size)
        .with_min_inner_size(size)
        .with_decorations(false)
        .with_title(APP_NAME)
        .with_closable(true)
        .build(&event_loop)
        .expect("failed to create window");

    let proxy = aero.proxy();
    let builder = WebViewBuilder::new()
        .with_custom_protocol(PROTOCOL.into(), |_id, req| utils::handle_req(&req))
        .with_url(&url)
        .with_accept_first_mouse(true)
        .with_navigation_handler(|url| {
            log::info!("navigating to {url}");
            true
        })
        .with_ipc_handler(move |req| {
            let event = match req.body().as_str() {
                "window_drag" => UserEvent::DragWindow,
                "window_minimize" => UserEvent::Minimize,
                "window_close" => UserEvent::Aero(AeroEvent::Request(AeroRequest::CloseWindow)),
                other => {
                    log::debug!("unhandled ipc message: {other}");
                    return;
                }
            };
            let _ = proxy.send_event(event);
        })
        .with_devtools(on_dev_channel);

    #[cfg(not(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "ios",
        target_os = "android"
    )))]
    let _webview = {
        use tao::platform::unix::WindowExtUnix;
        use wry::WebViewBuilderExtUnix;
        builder.build_gtk(window.default_vbox().expect("missing gtk vbox"))?
    };
    #[cfg(any(
        target_os = "windows",
        target_os = "macos",
        target_os = "ios",
        target_os = "android"
    ))]
    let _webview = builder.build(&window)?;

    log::info!("loading {url}");

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => *control_flow = ControlFlow::Exit,
            Event::UserEvent(UserEvent::DragWindow) => {
                let _ = window.drag_window();
            }
            Event::UserEvent(UserEvent::Minimize) => window.set_minimized(true),
            Event::UserEvent(UserEvent::Aero(AeroEvent::Request(AeroRequest::CloseWindow))) => {
                *control_flow = ControlFlow::Exit;
            }
            Event::UserEvent(UserEvent::Aero(event)) => log::info!("aero event: {event:?}"),
            _ => {}
        }
    });
}
