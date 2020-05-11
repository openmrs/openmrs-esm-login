import "@testing-library/jest-dom";
import React from "react";
import { of } from "rxjs";
import { cleanup, fireEvent, render, wait } from "@testing-library/react";
import ChooseLocation from "./choose-location.component";
import {
  getLoginLocations,
  setSessionLocation,
  searchLocationsFhir,
} from "./choose-location.resource";
import { act } from "react-dom/test-utils";

const historyMock = { push: jest.fn() };
const mockedSetSessionLocation = setSessionLocation as jest.Mock;
const mockSearch = searchLocationsFhir as jest.Mock;
const loginLocations = {
  data: {
    entry: [
      { resource: { id: "111", name: "Earth" } },
      { resource: { id: "222", name: "Mars" } },
    ],
  },
};
let locationData = {
  activeLocation: "",
  locationResult: loginLocations,
  emptyResult: false,
};
jest.mock("./choose-location.resource.ts", () => ({
  searchLocationsFhir: jest.fn().mockResolvedValue({
    data: {
      entry: [],
    },
  }),
  setSessionLocation: jest.fn().mockResolvedValue(null),
}));

jest.mock("lodash", () => ({
  debounce: jest.fn((fn) => fn),
  isEmpty: jest.fn((arr) => arr.length === 0),
}));

describe(`<ChooseLocation />`, () => {
  let earthInput,
    searchInput,
    marsInput,
    submitButton,
    wrapper,
    locationEntries;
  beforeEach(async () => {
    // reset mocks
    locationEntries = loginLocations.data.entry;
    historyMock.push.mockReset();
    mockedSetSessionLocation.mockReset();
    mockedSetSessionLocation.mockResolvedValue(null);
    //prepare components
    wrapper = render(
      <ChooseLocation history={historyMock} loginLocations={locationEntries} />
    );
    searchInput = wrapper.container.querySelector("input");
    submitButton = wrapper.getByText("Confirm", { selector: "button" });
  });

  afterEach(cleanup);
  it("trigger search on typing", async () => {
    mockSearch.mockResolvedValue(loginLocations);
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });
    await wait(() => {
      expect(wrapper.getByText("Mars")).not.toBeNull();
      expect(submitButton).toHaveAttribute("disabled");
    });
  });

  it(`disables/enables the submit button when input is invalid/valid`, async () => {
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });
    await wait(() => {
      expect(wrapper.queryByText("Mars")).not.toBeNull();
      marsInput = wrapper.getByLabelText("Mars");
    });
    act(() => {
      fireEvent.click(marsInput);
    });
    await wait(() => {
      expect(submitButton).not.toHaveAttribute("disabled");
    });
  });

  it(`makes an API request when you submit the form`, async () => {
    expect(setSessionLocation).not.toHaveBeenCalled();
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });
    await wait(() => {
      expect(wrapper.queryByText("Mars")).not.toBeNull();
      marsInput = wrapper.getByLabelText("Mars");
    });
    fireEvent.click(marsInput);
    fireEvent.click(submitButton);
    await wait(() => expect(setSessionLocation).toHaveBeenCalled());
  });

  it(`send the user to the home page on submit`, async () => {
    expect(setSessionLocation).not.toHaveBeenCalled();
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });
    await wait(() => {
      expect(wrapper.queryByText("Mars")).not.toBeNull();
      marsInput = wrapper.getByLabelText("Mars");
    });
    fireEvent.click(marsInput);
    fireEvent.click(submitButton);
    await wait(() => {
      expect(historyMock.push.mock.calls.length).toBe(1);
      expect(historyMock.push.mock.calls[0][0]).toBe("/home");
    });
  });

  it(`send the user to the redirect page on submit`, async () => {
    cleanup();
    mockSearch.mockResolvedValue(loginLocations);

    const locationMock = {
      state: {
        referrer: "/home/patient-search",
      },
    };
    wrapper = render(
      <ChooseLocation
        history={historyMock}
        loginLocations={locationEntries}
        location={locationMock}
      />
    );
    searchInput = wrapper.container.querySelector("input");
    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });
    await wait(() => {
      expect(wrapper.queryByText("Mars")).not.toBeNull();
      marsInput = wrapper.getByLabelText("Mars");
    });
    submitButton = wrapper.getByText("Confirm", { selector: "button" });
    expect(setSessionLocation).not.toHaveBeenCalled();
    fireEvent.click(marsInput);
    fireEvent.click(submitButton);
    await wait(() => {
      expect(historyMock.push.mock.calls.length).toBe(1);
      expect(historyMock.push.mock.calls[0][0]).toBe(
        locationMock.state.referrer
      );
    });
  });
});
