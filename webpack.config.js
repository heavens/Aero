const path = require('path');
const webpack = require("webpack");
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = typeof NODE_ENV !== 'undefined' && NODE_ENV === 'production';
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : "style-loader";

const port = 3000;
const publicPath = `http://aero.localhost:${port}/dist/`

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
        publicPath
    },
    plugins: [
        new HtmlWebpackPlugin({
            filename: "index.html",
            publicPath: path.resolve(__dirname, "dist"),
        }),
        new webpack.HotModuleReplacementPlugin(),
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
        port,
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, "css-loader"],
            },
            {
                test: /\.less$/i,
                use: [stylesHandler, "css-loader", "less-loader"],
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".wasm"]
    }
}