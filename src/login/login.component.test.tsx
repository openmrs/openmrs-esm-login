import "@testing-library/jest-dom";
import React from "react";
import Login from "./login.component";
import { performLogin } from "./login.resource";
import { cleanup, fireEvent, wait } from "@testing-library/react";
import renderWithRouter from "../test-helpers/render-with-router";

const historyMock = {
  push: jest.fn().mockImplementationOnce(location => location)
};
const locationMock = {
  state: {
    referrer: "/home/patient-search"
  }
};

const mockedLogin = performLogin as jest.Mock;

jest.mock("./login.resource", () => ({
  performLogin: jest.fn()
}));

describe(`<Login />`, () => {
  let wrapper;
  beforeEach(() => {
    mockedLogin.mockReset();
    wrapper = renderWithRouter(
      <Login history={historyMock} location={locationMock} />
    );
  });

  afterEach(cleanup);

  it(`renders a login form`, () => {
    wrapper.getByLabelText("Username");
    wrapper.getByLabelText("Password");
    wrapper.getByText("Login", { selector: "button" });
  });

  it(`disables/enables the submit button when input is invalid/valid`, () => {
    expect(wrapper.getByText("Login")).toHaveAttribute("disabled");
    fireEvent.change(wrapper.getByLabelText("Username"), {
      target: { value: "yoshi" }
    });
    expect(wrapper.getByText("Login")).toHaveAttribute("disabled");
    fireEvent.change(wrapper.getByLabelText("Password"), {
      target: { value: "no-tax-fraud" }
    });
    expect(wrapper.getByText("Login")).not.toHaveAttribute("disabled");
  });

  it(`makes an API request when you submit the form`, () => {
    mockedLogin.mockReturnValue(Promise.resolve({ some: "data" }));
    expect(performLogin).not.toHaveBeenCalled();
    fireEvent.change(wrapper.getByLabelText("Username"), {
      target: { value: "yoshi" }
    });
    fireEvent.change(wrapper.getByLabelText("Password"), {
      target: { value: "no-tax-fraud" }
    });
    fireEvent.click(wrapper.getByText("Login"));
    expect(performLogin).toHaveBeenCalled();
  });

  it(`send the user to the location select page on login`, async () => {
    mockedLogin.mockReturnValue(
      Promise.resolve({ data: { authenticated: true } })
    );
    fireEvent.change(wrapper.getByLabelText("Username"), {
      target: { value: "yoshi" }
    });
    fireEvent.change(wrapper.getByLabelText("Password"), {
      target: { value: "no-tax-fraud" }
    });
    fireEvent.click(wrapper.getByText("Login"));
    await wait(() => {
      expect(historyMock.push.mock.calls[0][0]).toBe("/login/location");
    });
  });
});
