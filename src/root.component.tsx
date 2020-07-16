import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import Login from "./login/login.component";
import ChooseLocation from "./choose-location/choose-location.component";
import { BrowserRouter, Route } from "react-router-dom";
import { defineConfigSchema, validators } from "@openmrs/esm-module-config";
import { CurrentUserContext } from "./CurrentUserContext";

defineConfigSchema("@openmrs/esm-login-app", {
  chooseLocation: {
    enabled: {
      default: true,
      description:
        "Whether to show a 'Choose Location' screen after login. " +
        "If true, the user will be taken to the loginSuccess URL after they " +
        "choose a location.",
      validators: [validators.isBoolean],
    },
  },
  links: {
    loginSuccess: {
      description: "Where to take the user after they are logged in.",
      url: {
        default: "/home",
      },
      spa: {
        default: true,
      },
    },
  },
  logo: {
    src: {
      default: null,
      description:
        "A path or URL to an image. Defaults to the OpenMRS SVG sprite.",
    },
    alt: {
      default: "Logo",
      description: "Alt text, shown on hover",
    },
  },
});

const Root: React.FC = () => (
  <CurrentUserContext>
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route exact path="/login" component={Login} />
      <Route exact path="/login/location" component={ChooseLocation} />
    </BrowserRouter>
  </CurrentUserContext>
);

export default openmrsRootDecorator({
  featureName: "login",
  moduleName: "@openmrs/esm-login-app",
})(Root);
