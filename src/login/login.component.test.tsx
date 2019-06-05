import React from "react";
import { mount } from "enzyme";
import Login from "./login.component";
import { performLogin } from "./login.resource";

const mockedLogin = performLogin as jest.Mock;

jest.mock("./login.resource", () => ({
  performLogin: jest.fn()
}));

describe(`<Login />`, () => {
  beforeEach(() => {
    mockedLogin.mockReset();
  });

  it(`renders a login form`, () => {
    const wrapper = mount(<Login />);
    expect(wrapper.find('input[type="text"][name="username"]').exists()).toBe(
      true
    );
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  it(`makes an API request when you submit the form`, () => {
    mockedLogin.mockReturnValueOnce(Promise.resolve({ some: "data" }));
    const wrapper = mount(<Login />);
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
});
