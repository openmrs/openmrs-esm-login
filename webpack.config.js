const path = require("path");
const CleanWebpackPlugin = require("clean-webpack-plugin").CleanWebpackPlugin;
const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");

const { peerDependencies } = require("./package.json");

const cssLoader = {
  loader: "css-loader",
  options: {
    modules: true,
  },
};

module.exports = {
  entry: [
    path.resolve(__dirname, "src/set-public-path.ts"),
    path.resolve(__dirname, "src/index.ts"),
  ],
  output: {
    filename: "openmrs-esm-login-app.js",
    libraryTarget: "system",
    path: path.resolve(__dirname, "dist"),
    jsonpFunction: "webpackJsonp_openmrs_esm_login",
  },
  module: {
    rules: [
      {
        parser: {
          system: false,
        },
      },
      {
        test: /\.m?(js|ts|tsx)$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.css$/,
        use: ["style-loader", cssLoader],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ["style-loader", cssLoader, "sass-loader"],
      },
    ],
  },
  devtool: "sourcemap",
  devServer: {
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    disableHostCheck: true,
  },
  externals: Object.keys(peerDependencies),
  plugins: [new ForkTsCheckerWebpackPlugin(), new CleanWebpackPlugin()],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
  },
};
