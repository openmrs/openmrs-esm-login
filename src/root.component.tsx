import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";

export default function Root(props: RootProps) {
  return (
    <BrowserRouter basename="/openmrs/spa">
      <Route to="login" component={Login} />
    </BrowserRouter>
  );
}

type RootProps = {};
