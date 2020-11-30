import React from "react";
import Login from "./login/login.component";
import ChooseLocation from "./choose-location/choose-location.component";
import { BrowserRouter, Route } from "react-router-dom";
import { CurrentUserContext } from "./CurrentUserContext";

export default function Root() {
  return (
    <CurrentUserContext>
      <BrowserRouter basename={window.getOpenmrsSpaBase()}>
        <Route exact path="/login" component={Login} />
        <Route exact path="/login/location" component={ChooseLocation} />
      </BrowserRouter>
    </CurrentUserContext>
  );
}
