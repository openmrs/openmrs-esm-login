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
});
