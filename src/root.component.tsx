import React from "react";
import openmrsRootDecorator from "@openmrs/react-root-decorator";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";

function Root(props) {
  return (
    <BrowserRouter basename={window["getOpenmrsSpaBase"]()}>
      <Route path="/login" component={Login} />
    </BrowserRouter>
  );
}
export default openmrsRootDecorator({ featureName: "login" })(Root);
