import React from "react";
import { AeroWindow } from "./App";
import RpcConnection from "./rpc";
import { LightTheme, Theme } from "./Theme";
import { BehaviorSubject, delay } from "rxjs";
import { Rasterizer } from "./renderer/Rasterizer";
import { AeroServer } from "./engine/aero";

declare global {
    
    var aero: Aero;

    interface Window {
        ipc: any;

        rpc: RpcConnection;
    }
}

const RendererIpc = window.ipc;

export type AeroContext = {
    renderer: Rasterizer;
    theme: Theme;
    browser?: boolean;
}

const Ctx = <AeroContext>{
    theme: LightTheme
};

export class Aero {

    _context = new BehaviorSubject(Ctx);
    _windowDpr: number = window.devicePixelRatio;

    public get dpr(): number {
        return this._windowDpr
    }
    
    public get context() {
        return this._context.getValue();
    }

    public dispatchInit = (state: AeroContext) => {
        this._context.next(state);
    }

    public onInit = () => this._context.asObservable().pipe(delay(3000));
}

globalThis.aero = new Aero();

export {
    React,
    AeroWindow,
    RpcConnection as RpcClient,
    RendererIpc,
    AeroServer
}
