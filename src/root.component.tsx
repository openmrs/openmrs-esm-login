import React from "react";
import { openmrsRootDecorator } from "@openmrs/esm-context";
import Login from "./login/login.component";
import ChooseLocation from "./choose-location/choose-location.component";
import { BrowserRouter, Route } from "react-router-dom";
import { defineConfigSchema, validators, Type } from "@openmrs/esm-config";
import { CurrentUserContext } from "./CurrentUserContext";

defineConfigSchema("@openmrs/esm-login-app", {
  chooseLocation: {
    enabled: {
      _type: Type.Boolean,
      _default: true,
      _description:
        "Whether to show a 'Choose Location' screen after login. " +
        "If true, the user will be taken to the loginSuccess URL after they " +
        "choose a location.",
    },
  },
  links: {
    loginSuccess: {
      _type: Type.String,
      _description: "Where to take the user after they are logged in.",
      _default: "${openmrsSpaBase}/home",
      _validators: [validators.isUrl],
    },
  },
  logo: {
    src: {
      _type: Type.String,
      _default: null,
      _description:
        "A path or URL to an image. Defaults to the OpenMRS SVG sprite.",
    },
    alt: {
      _type: Type.String,
      _default: "Logo",
      _description: "Alt text, shown on hover",
    },
  },
});

const Root: React.FC = () => (
  <CurrentUserContext>
    <BrowserRouter basename={window.getOpenmrsSpaBase()}>
      <Route exact path="/login" component={Login} />
      <Route exact path="/login/location" component={ChooseLocation} />
    </BrowserRouter>
  </CurrentUserContext>
);

export default openmrsRootDecorator({
  featureName: "login",
  moduleName: "@openmrs/esm-login-app",
})(Root);
