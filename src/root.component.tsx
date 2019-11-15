import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import { defineConfigSchema } from "@openmrs/esm-module-config";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";
import ChooseLocation from "./choose-location/choose-location.component";

defineConfigSchema("@openmrs/esm-login", {
  logo: {
    src: {
      default: null // defaults to an SVG Sprite
    },
    alt: {
      default: "Logo"
    }
  },
  links: {
    loginSuccess: {
      url: {
        default: "/home"
      },
      spa: {
        default: true
      }
    }
  }
});

function Root(props) {
  const [user, setUser] = React.useState(null);
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route exact path="/login" component={Login} />
      <Route exact path="/login/location" component={ChooseLocation} />
    </BrowserRouter>
  );
}
export default openmrsRootDecorator({
  featureName: "login",
  moduleName: "@openmrs/esm-login"
})(Root);
