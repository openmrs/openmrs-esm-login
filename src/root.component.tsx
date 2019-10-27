import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";
import { defineConfigSchema } from "@openmrs/esm-module-config";

defineConfigSchema("@openmrs/esm-login", {
  logo: {
    src: {
      default: null // defaults to an SVG Sprite
    },
    alt: {
      default: "Logo"
    }
  }
});

function Root(props) {
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route path="/login" component={Login} />
    </BrowserRouter>
  );
}
export default openmrsRootDecorator({ featureName: "login" })(Root);
