import { AeroServer } from "aero-ui";
import { InitRequest } from "./api";

let worker: ServerWorker;
let initialized = false;

globalThis.addEventListener("message", async (event: MessageEvent) => {
  if (!initialized) {
    worker = new ServerWorker();
    initialized = true;
  }

  worker.server.onMessage(event.data);
});

export default class ServerWorker {
  // The server process spawned as a result of either running the desktop app, which spawns a server process along with it, or
  // invoked manually (which is currently not recommended).
  server: AeroServer;

  constructor() {
    this.server = new AeroServer();
  }

  async initialize() {
    // Await the result returned from attempting to spawn the server process.
    let initRequest: InitRequest = {
      type: "Initialize",
      uri: window.location.host,
      path: "/"
    };
    return await this.server.initialize(initRequest);
  }
}