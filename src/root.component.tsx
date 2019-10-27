import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";
import { defineConfigSchema } from "@openmrs/esm-module-config";

defineConfigSchema("@openmrs/esm-login", {
  logoImgSrc: {
    default: null // defaults to an SVG Sprite
  },
  logoAlt: {
    default: "Logo"
  }
});

function Root(props) {
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <UseConfig moduleName="@openmrs/esm-login">
        <Route path="/login" component={Login} />
      </UseConfig>
    </BrowserRouter>
  );
}
export default openmrsRootDecorator({ featureName: "login" })(Root);
