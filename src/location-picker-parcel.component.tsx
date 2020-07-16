import React from "react";
import ReactDOM from "react-dom";
import singleSpaReact from "single-spa-react";
import LocationPicker from "./location-picker/location-picker.component";

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: LocationPicker,
});

export const { bootstrap, mount, unmount } = lifecycles;
