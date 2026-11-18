use std::{
    borrow::Cow,
    fs,
    path::{Component, Path, PathBuf},
};
use wry::http::{
    header::{ACCESS_CONTROL_ALLOW_ORIGIN, CONTENT_TYPE},
    Request, Response, StatusCode,
};

const ASSET_DIR: &str = "dist";

pub fn handle_req(request: &Request<Vec<u8>>) -> Response<Cow<'static, [u8]>> {
    let path = request.uri().path().trim_start_matches('/');
    let path = if path.is_empty() { "index.html" } else { path };

    let response = match resolve(path).and_then(|file| fs::read(file).ok()) {
        Some(content) => Response::builder()
            .header(CONTENT_TYPE, mime_type(path))
            .header(ACCESS_CONTROL_ALLOW_ORIGIN, "*")
            .body(Cow::Owned(content)),
        None => {
            log::warn!("asset not found: {path}");
            Response::builder()
                .status(StatusCode::NOT_FOUND)
                .body(Cow::Borrowed(&b"not found"[..]))
        }
    };

    response.unwrap_or_else(|e| {
        log::error!("failed to build response: {e}");
        Response::new(Cow::Borrowed(&[][..]))
    })
}

fn resolve(path: &str) -> Option<PathBuf> {
    let relative = Path::new(path);
    if !relative
        .components()
        .all(|c| matches!(c, Component::Normal(_)))
    {
        return None;
    }
    Some(Path::new(ASSET_DIR).join(relative))
}

fn mime_type(path: &str) -> &'static str {
    match Path::new(path).extension().and_then(|e| e.to_str()) {
        Some("html") => "text/html",
        Some("css") => "text/css",
        Some("js") => "text/javascript",
        Some("wasm") => "application/wasm",
        Some("png") => "image/png",
        Some("svg") => "image/svg+xml",
        Some("ttf") => "font/ttf",
        Some("woff") => "font/woff",
        Some("woff2") => "font/woff2",
        Some("json") => "application/json",
        _ => "application/octet-stream",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_traversal() {
        assert!(resolve("../Cargo.toml").is_none());
        assert!(resolve("a/../../b").is_none());
        assert!(resolve("/etc/passwd").is_none());
        #[cfg(windows)]
        assert!(resolve("C:/Windows/win.ini").is_none());
    }

    #[test]
    fn accepts_nested_assets() {
        assert_eq!(
            resolve("js/main.js"),
            Some(Path::new(ASSET_DIR).join("js/main.js"))
        );
    }

    #[test]
    fn mime_types() {
        assert_eq!(mime_type("index.html"), "text/html");
        assert_eq!(mime_type("aero_bg.wasm"), "application/wasm");
        assert_eq!(mime_type("unknown.bin"), "application/octet-stream");
    }
}
