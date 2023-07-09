import { ZephyrServer } from "../pkg/zephyr";

const encoder = new TextEncoder();
const decoder = new TextDecoder("utf-8");

class Server {
  private server: ZephyrServer;
  constructor() {
    this.server = new ZephyrServer();
    document.addEventListener("message", async (event: MessageEvent) => {
      this.handleMessage(event);
    });
    // this.server.startApp(new JsSink({
    //   send: (buffer: Uint8Array) => {
    //     const decoded = JSON.parse(decoder.decode(buffer));
    //     if (decoded.type === "OpenWindow") {
    //       this.startWindow(decoded.window_id);
    //     } else {
    //       throw new Error("Expected first message type to be OpenWindow");
    //     }
    //   }
    // }));
  }

  // startWindow(windowId: number) {
  //   console.log("requested to open window "+ windowId);
  //   this.server.startWindow(
  //     windowId,
  //     this.windowReceiver,
  //     new JsSink({
  //       send(buffer: Uint8Array) {
  //         postMessage(JSON.parse(decoder.decode(buffer)));
  //       }
  //     })
  //   );
  // }

  // connectToWebsocket(url: URL) {
  //   const channel = Channel.new();
  //   const socket = new WebSocket(url);
  //   const sender = channel.take_sender();
  //   socket.binaryType = "arraybuffer";
  //   socket.addEventListener("message", function (event) {
  //     const data = new Uint8Array(event.data);
  //     sender.send(data);
  //   });
  // }

  handleMessage(message: MessageEvent) {
    switch (message.type) {
      case "ConnectToWebsocket":
        // this.connectToWebsocket(new URL(message.origin));
        break;
      case "Action":
        // this.windowSender.send(encoder.encode(JSON.stringify(message)));
        break;
      default:
        console.info("Unsupported message", message);
    }
  }
}