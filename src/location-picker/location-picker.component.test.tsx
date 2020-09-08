import "@testing-library/jest-dom";
import React from "react";
import { act } from "react-dom/test-utils";
import { cleanup, fireEvent, render, wait } from "@testing-library/react";
import LocationPicker from "./location-picker.component";

const loginLocations = {
  data: {
    entry: [
      { resource: { id: "111", name: "Earth" } },
      { resource: { id: "222", name: "Mars" } },
    ],
  },
};

jest.mock("lodash", () => ({
  debounce: jest.fn((fn) => fn),
  isEmpty: jest.fn((arr) => arr.length === 0),
}));

describe(`<LocationPicker />`, () => {
  let searchInput,
    marsInput,
    submitButton,
    wrapper,
    locationEntries,
    onChangeLocation,
    searchLocations;

  beforeEach(async () => {
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => "111"),
        setItem: jest.fn(),
      },
      writable: true,
    });

    // reset mocks
    locationEntries = loginLocations.data.entry;
    onChangeLocation = jest.fn(() => {});
    searchLocations = jest.fn(() => Promise.resolve([]));

    //prepare components
    wrapper = render(
      <LocationPicker
        loginLocations={locationEntries}
        onChangeLocation={onChangeLocation}
        searchLocations={searchLocations}
        currentUser=""
      />
    );

    searchInput = wrapper.container.querySelector("input");
    submitButton = wrapper.getByText("Confirm", { selector: "button" });
  });

  afterEach(cleanup);

  it("trigger search on typing", async () => {
    cleanup();
    searchLocations = jest.fn(() => Promise.resolve(loginLocations));
    wrapper = render(
      <LocationPicker
        loginLocations={locationEntries}
        onChangeLocation={onChangeLocation}
        searchLocations={searchLocations}
        currentUser=""
      />
    );

    fireEvent.change(searchInput, { target: { value: "mars" } });

    await wait(() => {
      expect(wrapper.getByLabelText("Mars")).not.toBeNull();
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
    expect(onChangeLocation).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });

    await wait(() => {
      expect(wrapper.queryByText("Mars")).not.toBeNull();
      marsInput = wrapper.getByLabelText("Mars");
    });

    fireEvent.click(marsInput);
    fireEvent.click(submitButton);

    await wait(() => expect(onChangeLocation).toHaveBeenCalled());
  });

  it(`send the user to the home page on submit`, async () => {
    expect(onChangeLocation).not.toHaveBeenCalled();

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
      expect(onChangeLocation).toHaveBeenCalled();
    });
  });

  it(`send the user to the redirect page on submit`, async () => {
    expect(onChangeLocation).not.toHaveBeenCalled();

    act(() => {
      fireEvent.change(searchInput, { target: { value: "Mars" } });
    });

    await wait(() => {
      expect(wrapper.queryByText("Mars")).not.toBeNull();
      marsInput = wrapper.getByLabelText("Mars");
    });

    submitButton = wrapper.getByText("Confirm", { selector: "button" });

    fireEvent.click(marsInput);
    fireEvent.click(submitButton);

    await wait(() => {
      expect(onChangeLocation).toHaveBeenCalled();
    });
  });

  it("search term input should have autofocus on render", async () => {
    expect(wrapper.getByPlaceholderText(/Search for location/)).toEqual(
      document.activeElement
    );
  });

  it("should deselect active location when user searches for a location", async () => {
    const locationRadioButton: HTMLElement = await wrapper.findByLabelText(
      /Earth/
    );
    fireEvent.click(locationRadioButton);
    expect(locationRadioButton).toHaveProperty("checked", true);
    const searchInput: HTMLElement = await wrapper.findByPlaceholderText(
      /Search for location/
    );
    fireEvent.change(searchInput, { target: { value: "Mar" } });
    expect(locationRadioButton).toHaveProperty("checked", false);
  });

  it("shows no location found", async () => {
    fireEvent.change(searchInput, { target: { value: "doof" } });

    await wait(() => {
      expect(
        wrapper.getByText("Sorry, no location has been found")
      ).not.toBeNull();
    });
    expect(submitButton).toHaveAttribute("disabled");
  });

  it("should get user Default location on render and auto select the location", async () => {
    expect(
      window.localStorage.getItem("userDefaultLoginLocationKeyDemo")
    ).toEqual("111");
    const locationRadioButton: HTMLElement = await wrapper.findByLabelText(
      /Earth/
    );
    expect(locationRadioButton).toHaveProperty("checked", true);
  });

  it("should set user Default location when location is changed", async () => {
    const locationRadioButton: HTMLElement = await wrapper.findByLabelText(
      /Earth/
    );
    fireEvent.click(locationRadioButton);
    expect(window.localStorage.setItem).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith(
      "userDefaultLoginLocationKey",
      "111"
    );
  });
});
