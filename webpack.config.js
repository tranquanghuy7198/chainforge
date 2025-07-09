const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");

/** @type {import("webpack").Configuration} */
const config = {
  mode: "development",
  entry: "./src/index.tsx",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  devtool: "source-map",
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      "process": require.resolve("process/browser.js"),
      "buffer": require.resolve("buffer"),
      "stream": require.resolve("stream-browserify"),
      "util": require.resolve("util"),
      "crypto": require.resolve("crypto-browserify"),
      "vm": require.resolve("vm-browserify"),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: "asset/resource",
        exclude: /node_modules/,
      },
      {
        test: /\.(css|sass|scss)$/i,
        use: ["style-loader", "css-loader", "sass-loader"],
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      templateParameters: {
        PUBLIC_URL: "./public"
      }
    }),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
      process: "process/browser.js",
    }),
  ],
  devServer: {
    static: path.resolve(__dirname, "dist"),
    compress: true,
    port: 3006,
    open: true,
  },
};

module.exports = config;
