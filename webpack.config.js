const path = require('path');
const webpack = require("webpack");
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = {
    mode: "development",
    // TODO(mack): Cheapfix for now until I get around to organizing bundles otherwise webpack complains that we're making too fat of assets.
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry: {
        main: "./crates/web/js/app.ts",
        server: "./crates/web/js/server.ts",
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
        new webpack.ProvidePlugin({
            process: 'process/browser',
        })
    ],
    experiments: {
        asyncWebAssembly: true,
    },
    devServer: {
        host: "localhost",
        port: 3000,
        static: path.resolve(__dirname, "static")
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/
            },
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".wasm"]
    }
}