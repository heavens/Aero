use std::{fs, borrow::Cow, path::PathBuf};
use wry::http::{Response, Request, header::{CONTENT_TYPE, ACCESS_CONTROL_ALLOW_ORIGIN}};

/// Intercepts the incoming request and add in our own handler.
/// * `request` - The incoming http request to be passed into our handler.
pub fn handle_req(request: &Request<Vec<u8>>) -> wry::Result<Response<Cow<'static, [u8]>>> {
    let path: &str = &request.uri().path()[1..];
    log::info!("requesting file {}", path);
    let content = fs::read(fs::canonicalize(PathBuf::from("dist").join(path))?)?;
    let mimetype = if path == "/" || path.ends_with(".html") {
        "text/html"
    } else if path.ends_with(".css") || path.ends_with(".less") {
        "text/css"
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
        .header(ACCESS_CONTROL_ALLOW_ORIGIN, "*")
        .body(Cow::Owned(content))
        .map_err(Into::into)
}