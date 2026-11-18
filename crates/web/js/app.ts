const { AeroWindow, RpcClient } = await import("aero-ui");
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import "./../../../static/theme.less";
import ServerWorker from "./worker";
import { NotifyInitialized } from "./api";

window.rpc = new RpcClient(new Worker("worker.js"));

let initialized = false;
async function run() {
  // Loads the app and concerning processes lazily. This should never be reached more than once.
  if (!initialized) {
    // Spawn the server process first before loading the frontend environment so that we can pass the result over. 
    // The order here is important as it allows for passing error-related info to be displayed within the frontend 
    // in the event of a failure or passing in required runtime values on success.
    const response = await spawnServer();
    loadAppWindow(response);
    initialized = true;
  }
}

/**
 * Starts the frontend, mounting the app to be displayed accordingly.
 */
function loadAppWindow(notif: NotifyInitialized) {
  const el = document.getElementById("app");
  const root = createRoot(el);
  root.render(createElement(AeroWindow, {
    browser: notif?.browser || false,
  }));
}

/**
 * Attempts to spawn the server process, returning the result.
 */
async function spawnServer() {
  const server = new ServerWorker();
  return await server.initialize() as NotifyInitialized;
}

run().catch(console.error);