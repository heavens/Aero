import React from "react";
import RpcClient from "./rpc-client";
import App from "./app";

declare global {
    interface Window {
        ipc: any;
    }
}

export const RendererIpc = window.ipc;

export {
    React,
    RpcClient,
    App
}
