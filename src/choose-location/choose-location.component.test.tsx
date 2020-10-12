import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { cleanup, wait } from "@testing-library/react";
import { queryLocations } from "./choose-location.resource";
import ChooseLocation from "./choose-location.component";
import renderWithRouter from "../test-helpers/render-with-router";

const { config } = require("@openmrs/esm-config");

jest.mock('../CurrentUserContext', () => ({
  useCurrentUser() {
    return {
      display: "Demo",
    };
  },
}))

jest.mock("./choose-location.resource.ts", () => ({
  queryLocations: jest.fn(() =>
    Promise.resolve([
      {
        resource: {
          id: "abc",
          name: "foo",
        },
      },
    ])
  ),
  setSessionLocation: jest.fn(() => Promise.resolve()),
}));

describe(`<ChooseLocation />`, () => {
  afterEach(cleanup);

  it(`should redirect back to referring page on successful login when there is only one location`, async () => {
    const locationMock = {
      state: {
        referrer: "/home/patient-search",
      },
    };
    cleanup();
    const wrapper = renderWithRouter(ChooseLocation, {
      location: locationMock,
    });
    await act(wait);
    expect(wrapper.history.location.pathname).toBe(locationMock.state.referrer);
  });

  it(`should set location and skip location select page if there is exactly one location`, async () => {
    cleanup();
    const wrapper = renderWithRouter(ChooseLocation, {});
    await act(wait);
    expect(wrapper.history.location.pathname).toBe("/home");
  });

  it(`should set location and skip location select page if there is no location`, async () => {
    cleanup();
    (queryLocations as any).mockImplementationOnce(() => Promise.resolve([]));
    const wrapper = renderWithRouter(ChooseLocation, {});
    await act(wait);
    expect(wrapper.history.location.pathname).toBe("/home");
  });

  it(`should show the location picker when multiple locations exist`, async () => {
    cleanup();
    (queryLocations as any).mockImplementationOnce(() =>
      Promise.resolve([
        {
          resource: {
            id: "abc",
            name: "foo",
          },
        },
        {
          resource: {
            id: "def",
            name: "ghi",
          },
        },
      ])
    );
    const wrapper = renderWithRouter(ChooseLocation, {});
    await act(wait);
    expect(wrapper.history.location.pathname).toBe("/");
  });

  it(`should not show the location picker when disabled`, async () => {
    cleanup();
    config.chooseLocation.enabled = false;
    (queryLocations as any).mockImplementationOnce(() =>
      Promise.resolve([
        {
          resource: {
            id: "abc",
            name: "foo",
          },
        },
        {
          resource: {
            id: "def",
            name: "ghi",
          },
        },
      ])
    );
    const wrapper = renderWithRouter(ChooseLocation, {});
    await act(wait);
    expect(wrapper.history.location.pathname).toBe("/home");
  });

  it(`should redirect to custom path if configured`, async () => {
    cleanup();
    config.links.loginSuccess.url = "/foo";
    const wrapper = renderWithRouter(ChooseLocation, {});
    await act(wait);
    expect(wrapper.history.location.pathname).toBe("/foo");
  });
});
