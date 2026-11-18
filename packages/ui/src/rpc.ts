export default class RpcConnection {
    worker: Worker;
    constructor(worker: Worker) {
        this.worker = worker;
    }

    onMessage(callback: any) {
        this.worker.addEventListener("message", message => {
            callback(message.data);
        });
    }

    sendMessage(message: any) {
        this.worker.postMessage(message);
    }
}
