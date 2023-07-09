const { App, RpcClient } = await import("zephyr-ui");
import { createElement } from "react";
import { createRoot } from "react-dom/client";

const client = new RpcClient(new Worker("server.js"));
const websocketURL = new URL("/ws", window.location.href);
websocketURL.protocol = "ws";
client.sendMessage({ type: "ConnectToWebsocket", url: websocketURL.href });
let loading = true;
function start_client() {
  if (loading) {
    const el = document.getElementById("app");
    const root = createRoot(el);
    root.render(createElement(App, {
      inBrowser: false
    }));
    loading = false;
  }
}

start_client();