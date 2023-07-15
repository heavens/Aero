const path = require('path');
const { env } = require("process");
const { ProvidePlugin } = require("webpack");
const { merge } = require("webpack-merge");
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const express = require("express");
const http = require("http");
const ws = require("ws");
const webpackDev = require("webpack-dev-middleware");

const isProduction = env.NODE_ENV !== 'undefined' && env.NODE_ENV === 'production';
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : "style-loader";

const common = {
    mode: "development",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".wasm"]
    },
    experiments: {
        asyncWebAssembly: true,
    }
};

const webworker = merge({}, common, {
    target: "webworker",
    entry: "./crates/web/js/worker.ts",
    output: {
        filename: "worker.js",
        path: path.join(__dirname, "dist"),
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.less$/i,
                use: [
                    stylesHandler,
                    "css-loader",
                    "less-loader",
                ],
            },
        ]
    },
    devServer: {
        hot: true,
        host: "localhost",
        // port: 3000,
        client: {
            overlay: true,
            progress: true,
            // webSocketURL: {
            //     hostname: '0.0.0.0',
            //     pathname: '/ws',
            //     port: 8080,
            //     protocol: 'ws',
            // },
        },
        static: {
            directory: path.resolve(__dirname, "dist"),
        }
    },
});

const main = merge({}, common, {
    // TODO(mack): Cheapfix for now until I get around to organizing bundles otherwise webpack complains that we're making too fat of assets.
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry: {
        main: "./crates/web/js/app.ts",
        lib: "./crates/web/js/lib.ts"
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "crates", "web"),
            args: '--log-level warn',
            outName: "zephyr",
            outDir: path.resolve(__dirname, "crates", "web", "pkg")
        }),
        new ProvidePlugin({
            process: 'process/browser',
        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.less$/i,
                use: [
                    stylesHandler,
                    "css-loader",
                    "less-loader",
                ],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
        ]
    }
});

module.exports = [webworker, main];

// const websocketServer = new ws.Server({ host: "localhost", port: "8080", path: "/ws" });
// websocketServer.on("connection", async ws => {
//     const connection = new Socket();

//     let incomingMessage = null;
//     let remainingBytes = 0;
//     connection.on("data", data => {
//         let offset = 0;
//         while (offset < data.length) {
//             if (incomingMessage) {
//                 assert(remainingBytes !== 0, "remainingBytes should not be 0");
//                 const copiedBytes = data.copy(
//                     incomingMessage,
//                     incomingMessage.length - remainingBytes,
//                     offset,
//                     offset + remainingBytes
//                 );
//                 remainingBytes -= copiedBytes;
//                 offset += copiedBytes;
//             } else {
//                 remainingBytes = data.readUInt32BE(offset);
//                 incomingMessage = Buffer.alloc(remainingBytes);
//                 offset += 4;
//             }

//             if (incomingMessage && remainingBytes === 0) {
//                 try {
//                     ws.send(incomingMessage);
//                 } catch (error) {
//                     console.error("Error sending to web socket:", error);
//                 }
//                 incomingMessage = null;
//             }
//         }
//     });

//     await new Promise(resolve => {
//         connection.connect(
//             { host: "localhost", port: 8080 },
//             resolve
//         );
//     });
//     ws.on("message", message => {
//         const bufferLengthHeader = Buffer.alloc(4);
//         bufferLengthHeader.writeUInt32BE(message.length, 0);
//         connection.write(Buffer.concat([bufferLengthHeader, message]));
//     });
//     ws.on("close", () => connection.destroy());
// });