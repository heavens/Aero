import React from "react";
import App from "./App";
import RpcConnection from "./rpc";

declare global {
    interface Window {
        ipc: any;

        rpc: RpcConnection;
    }
}

export const RendererIpc = window.ipc;

export {
    React,
    App,
    RpcConnection as RpcClient
}
