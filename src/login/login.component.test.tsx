import React from "react";
import { mount } from "enzyme";
import Login from "./login.component";
import { performLogin } from "./login.resource";
import { act } from "react-dom/test-utils";

const historyMock = { push: jest.fn() };
const mockedLogin = performLogin as jest.Mock;

jest.mock("./login.resource", () => ({
  performLogin: jest.fn()
}));

const loginLocations = [
  { uuid: "111", display: "Earth" },
  { uuid: "222", display: "Mars" }
];

describe(`<Login />`, () => {
  const wrapper = mount(
    <Login history={historyMock} loginLocations={loginLocations} />
  );
  beforeEach(() => {
    mockedLogin.mockReset();
    historyMock.push.mockRestore();
  });

  it(`renders a login form`, () => {
    expect(wrapper.find('input[type="text"][name="username"]').exists()).toBe(
      true
    );
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it(`disables/enables the submit button when input is invalid/valid`, () => {
    expect(wrapper.find('button[type="submit"]').prop("disabled")).toBeTruthy();
    wrapper
      .find('input[type="text"][name="username"]')
      .simulate("change", { target: { value: "yoshi" } });
    expect(wrapper.find('button[type="submit"]').prop("disabled")).toBeTruthy();
    wrapper
      .find('input[type="password"]')
      .simulate("change", { target: { value: "no-tax-fraud" } });
    expect(wrapper.find('button[type="submit"]').prop("disabled")).toBeFalsy();
  });

  it(`makes an API request when you submit the form`, () => {
    mockedLogin.mockReturnValue(Promise.resolve({ some: "data" }));
    expect(performLogin).not.toHaveBeenCalled();
    wrapper
      .find('input[type="text"][name="username"]')
      .simulate("change", { target: { value: "yoshi" } });
    wrapper
      .find('input[type="password"]')
      .simulate("change", { target: { value: "no-tax-fraud" } });
    wrapper.find("form").simulate("submit", { preventDefault() {} });
    expect(performLogin).toHaveBeenCalled();
  });

  xit(`send the user to the location select page on login if there is more than one location`, () => {
    mockedLogin.mockReturnValue(
      Promise.resolve({ data: { authenticated: true } })
    );
    wrapper
      .find('input[type="text"][name="username"]')
      .simulate("change", { target: { value: "yoshi" } });
    wrapper
      .find('input[type="password"]')
      .simulate("change", { target: { value: "no-tax-fraud" } });
    wrapper.find("form").simulate("submit", { preventDefault() {} });
    setImmediate(() => {
      expect(historyMock.push.mock.calls.length).toBe(1);
      expect(historyMock.push.mock.calls[0][0]).toBe("/login/location");
    });
  });

  it(`should skip the location select page if there is only one location`, () => {
    wrapper.setProps({ loginLocations: [loginLocations[0]] });
    mockedLogin.mockReturnValue(
      Promise.resolve({ data: { authenticated: true } })
    );
    wrapper
      .find('input[type="text"][name="username"]')
      .simulate("change", { target: { value: "yoshi" } });
    wrapper
      .find('input[type="password"]')
      .simulate("change", { target: { value: "no-tax-fraud" } });
    wrapper.find("form").simulate("submit", { preventDefault() {} });
    setImmediate(() => {
      expect(historyMock.push.mock.calls.length).toBe(1);
      expect(historyMock.push.mock.calls[0][0]).toBe("/home");
    });
  });
});
