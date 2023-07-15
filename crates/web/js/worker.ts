import { AeroServer } from "../pkg/zephyr";
import { InitRequest } from "./api";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

let worker: ServerWorker;
let initialized = false;
globalThis.addEventListener("message", async (event: MessageEvent) => {
  if (!initialized) {
    worker = new ServerWorker();
    initialized = true;
  }

  console.log(event.data);
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
      addr: window.location.host,
      workspacePath: "/"
    };
    return await this.server.initialize(initRequest);
  }
}