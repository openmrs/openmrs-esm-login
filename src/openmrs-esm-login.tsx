import "./set-public-path";
import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import Root from "./root.component";
// import { loadConfig } from "@openmrs/esm-root-config";
import { defineConfigSchema } from "@openmrs/esm-root-config/dist/openmrs-esm-root-config.lib.js";

defineConfigSchema("@openmrs/esm-login", {
  logoImgSrc: {
    default: null // defaults to an SVG Sprite
  }
});

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: Root
});

export const bootstrap = lifecycles.bootstrap;
export const mount = lifecycles.mount;
export const unmount = lifecycles.unmount;
