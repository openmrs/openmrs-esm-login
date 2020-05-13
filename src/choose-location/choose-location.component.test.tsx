import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { cleanup, wait } from "@testing-library/react";
import ChooseLocation from "./choose-location.component";
import renderWithRouter from "../test-helpers/render-with-router";

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

jest.mock("@openmrs/esm-api", () => ({
  getCurrentUser: jest.fn(() => ({
    subscribe(cb: (user: any) => void) {
      cb({
        display: "Demo",
      });
      return {
        unsubscribe() {},
      };
    },
  })),
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
});
