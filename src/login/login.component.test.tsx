import "@testing-library/jest-dom";
import Login from "./login.component";
import { cleanup, fireEvent, wait } from "@testing-library/react";
import { performLogin } from "./login.resource";
import { setSessionLocation } from "../choose-location/choose-location.resource";
import renderWithRouter from "../test-helpers/render-with-router";

const mockedLogin = performLogin as jest.Mock;
jest.mock("./login.resource", () => ({
  performLogin: jest.fn(),
}));

const mockedSetSessionLocation = setSessionLocation as jest.Mock;
jest.mock("../choose-location/choose-location.resource", () => ({
  setSessionLocation: jest.fn(),
}));

const loginLocations = [
  { uuid: "111", display: "Earth" },
  { uuid: "222", display: "Mars" },
];

describe(`<Login />`, () => {
  let wrapper, history;
  beforeEach(() => {
    mockedLogin.mockReset();
    mockedSetSessionLocation.mockReset();
    wrapper = renderWithRouter(Login, { loginLocations: loginLocations });
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
      target: { value: "yoshi" },
    });
    expect(wrapper.getByText("Login")).toHaveAttribute("disabled");
    fireEvent.change(wrapper.getByLabelText("Password"), {
      target: { value: "no-tax-fraud" },
    });
    expect(wrapper.getByText("Login")).not.toHaveAttribute("disabled");
  });

  it(`makes an API request when you submit the form`, async () => {
    mockedLogin.mockReturnValue(Promise.resolve({ some: "data" }));
    expect(performLogin).not.toHaveBeenCalled();
    fireEvent.change(wrapper.getByLabelText("Username"), {
      target: { value: "yoshi" },
    });
    fireEvent.change(wrapper.getByLabelText("Password"), {
      target: { value: "no-tax-fraud" },
    });
    fireEvent.click(wrapper.getByText("Login"));
    await wait();
    expect(performLogin).toHaveBeenCalled();
  });

  it(`send the user to the location select page on login if there is more than one location`, async () => {
    mockedLogin.mockReturnValue(
      Promise.resolve({ data: { authenticated: true } })
    );
    fireEvent.change(wrapper.getByLabelText("Username"), {
      target: { value: "yoshi" },
    });
    fireEvent.change(wrapper.getByLabelText("Password"), {
      target: { value: "no-tax-fraud" },
    });
    fireEvent.click(wrapper.getByText("Login"));
    await wait();
    expect(wrapper.history.location.pathname).toBe("/login/location");
  });
});
