import React from "react";
import { BrowserRouter, Route } from "react-router-dom";
import Login from "./login/login.component";

export default class Root extends React.Component {
  state = {
    catastrophicError: false
  };
  render() {
    return this.state.catastrophicError
      ? this.errorHasOccurred()
      : this.loginPages();
  }
  componentDidCatch() {
    this.setState({ catastrophicError: true });
  }
  errorHasOccurred = () => {
    // TO-DO have a good UX for catastrophic errors
    return null;
  };
  loginPages = () => {
    return (
      <BrowserRouter basename="/openmrs/spa">
        <Route to="login" component={Login} />
      </BrowserRouter>
    );
  };
}
