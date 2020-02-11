import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import { defineConfigSchema } from "@openmrs/esm-module-config";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";
import ChooseLocation from "./choose-location/choose-location.component";
import { getLoginLocations } from "./choose-location/choose-location.resource";

defineConfigSchema("@openmrs/esm-login", {
  chooseLocation: {
    enabled: {
      default: true
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
  },
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
  const [user, setUser] = React.useState(null);
  const [loginLocations, setLoginLocations] = React.useState([]);

  React.useEffect(() => {
    const sub = getLoginLocations().subscribe(
      locations => setLoginLocations(locations),
      createErrorHandler()
    );
    return () => sub.unsubscribe();
  }, []);

  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route
        exact
        path="/login"
        render={props => <Login {...props} loginLocations={loginLocations} />}
      />
      <Route
        exact
        path="/login/location"
        render={props => (
          <ChooseLocation {...props} loginLocations={loginLocations} />
        )}
      />
    </BrowserRouter>
  );
}
export default openmrsRootDecorator({
  featureName: "login",
  moduleName: "@openmrs/esm-login"
})(Root);
