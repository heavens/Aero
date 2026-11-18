const path = require('path');
const { env } = require("process");
const { ProvidePlugin } = require("webpack");
const { merge } = require("webpack-merge");
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

const isProduction = env.NODE_ENV === 'production';
const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : "style-loader";

const common = {
    mode: isProduction ? "production" : "development",
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".wasm", ".svg"]
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
    plugins: [
        new ProvidePlugin({
            process: 'process/browser',
        })
    ],
    module: {
        rules: [
            {
                test: /\.(ts$|tsx)/,
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
            }
        ]
    },
    devServer: {
        hot: true,
        host: "localhost",
        client: {
            overlay: true,
            progress: true,
        },
        static: {
            directory: path.resolve(__dirname, "dist"),
        }
    },
});

const main = merge({}, common, {
    target: "web",
    // TODO(mack): Cheapfix for now until I get around to organizing bundles otherwise webpack complains that we're making 
    // too fat of assets.
    performance: {
        hints: false,
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    },
    entry: {
        main: "./crates/web/js/app.ts",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new WasmPackPlugin({
            crateDirectory: path.resolve(__dirname, "crates", "web"),
            args: '--log-level warn',
            inName: "aero",
            outName: "aero",
            outDir: path.resolve(__dirname, "packages", "ui", "src", "engine")
        }),
        new ProvidePlugin({
            process: 'process/browser',
        }),
        new CopyPlugin({
            patterns: [
                { from: "static/index.html" },
                { from: "static/iosevka-regular.ttf" },
                { from: "static/codicon.ttf" },
                { from: "static/octicons.woff" },
            ],
        }),
        ...(isProduction ? [new MiniCssExtractPlugin()] : []),
    ],
    resolve: {
        extensions: [".ts", ".tsx", ".js", ".jsx", ".wasm"],
        alias: {
            "@": path.resolve(__dirname, "packages", "ui", "src")
        }
    },
    module: {
        rules: [
            {
                test: /\.(ts$|tsx)/,
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
                test: /\.svg$/i,
                issuer: /\.[jt]sx?$/,
                use: ['@svgr/webpack'],
            },
        ]
    }
});

module.exports = [webworker, main];