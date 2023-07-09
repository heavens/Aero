use std::{
    borrow::Cow,
    fs::{canonicalize, read},
};
use wry::{
    application::{
        event::{Event, StartCause, WindowEvent},
        event_loop::{ControlFlow, EventLoop},
        window::WindowBuilder,
    },
    http::{header::CONTENT_TYPE, Request, Response},
    webview::WebViewBuilder,
};

const PROTOCOL: &'static str = "zephyr";

fn main() -> wry::Result<()> {
    // Construct our event loop.
    let event_loop = EventLoop::new();
    let builder = WindowBuilder::new()
        .with_title("Zephyr")
        .build(&event_loop)?;

    // Build the webview. A naive approach currently, but it works for now.
    let _webview = WebViewBuilder::new(builder)?
        .with_custom_protocol(PROTOCOL.into(), handle_req)
        .with_url(&format!("{}://localhost:3000/dist/index.html", PROTOCOL))?
        .build()?;

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::NewEvents(StartCause::Init) => {}
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => *control_flow = ControlFlow::Exit,
            _ => (),
        }
    });
}

/// Intercepts the incoming request and add in our own handler.
/// * `request` - The incoming http request to be passed into our handler.
fn handle_req(request: &Request<Vec<u8>>) -> wry::Result<Response<Cow<'static, [u8]>>> {
    let path: &str = &request.uri().path()[1..];
    let content = read(canonicalize(path)?)?;
    let mimetype = if path.ends_with(".html") || path == "/" {
        "text/html"
    } else if path.ends_with(".js") {
        "text/javascript"
    } else if path.ends_with(".png") {
        "image/png"
    } else if path.ends_with(".wasm") {
        "application/wasm"
    } else {
        "text/html"
    };
    
    Response::builder()
        .header(CONTENT_TYPE, mimetype)
        .body(Cow::Owned(content))
        .map_err(Into::into)
}
