import React from "react";
import { of } from "rxjs";
import { mount } from "enzyme";
import { wait } from "@testing-library/react";
import ChooseLocation from "./choose-location.component";
import {
  getLoginLocations,
  setSessionLocation
} from "./choose-location.resource";
import { act } from "react-dom/test-utils";

const historyMock = { push: jest.fn() };

jest.mock("./choose-location.resource");
const mockedGetLoginLocations = getLoginLocations as jest.Mock;
const mockedSetSessionLocation = setSessionLocation as jest.Mock;

mockedGetLoginLocations.mockReturnValue(
  of([{ uuid: "111", display: "Earth" }, { uuid: "222", display: "Mars" }])
);

describe(`<ChooseLocation />`, () => {
  beforeEach(() => {
    mockedGetLoginLocations.mockReset();
    mockedSetSessionLocation.mockReset();
    mockedGetLoginLocations.mockReturnValue(
      of([{ uuid: "111", display: "Earth" }, { uuid: "222", display: "Mars" }])
    );
    mockedSetSessionLocation.mockResolvedValue({});
  });

  const wrapper = mount(<ChooseLocation history={historyMock} />);

  it(`renders a location picker`, () => {
    expect(
      wrapper.find('input[type="radio"][name="location"][value="111"]').exists()
    ).toBe(true);
    expect(
      wrapper.find('input[type="radio"][name="location"][value="222"]').exists()
    ).toBe(true);
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
  });

  it(`disables/enables the submit button when input is invalid/valid`, () => {
    expect(wrapper.find('button[type="submit"]').prop("disabled")).toBeTruthy();
    wait(() => {
      wrapper
        .find('input[name="location"][value="222"]')
        .simulate("change", { target: { name: "location", checked: "true" } });
      expect(
        wrapper.find('input[name="location"][value="222"]').prop("checked")
      ).toBeTruthy();
      expect(
        wrapper.find('button[type="submit"]').prop("disabled")
      ).toBeFalsy();
    });
  });

  it(`makes an API request when you submit the form`, () => {
    expect(setSessionLocation).not.toHaveBeenCalled();
    wrapper
      .find('input[name="location"][value="222"]')
      .simulate("change", { target: { checked: "true" } });
    wrapper.find("form").simulate("submit", { preventDefault() {} });
    setImmediate(() => {
      expect(setSessionLocation).toHaveBeenCalled();
    });
  });

  it(`send the user to the target page on submit`, () => {
    expect(setSessionLocation).not.toHaveBeenCalled();
    wrapper
      .find('input[type="radio"][value="222"]')
      .simulate("change", { target: { checked: "true" } });
    wrapper.find("form").simulate("submit", { preventDefault() {} });
    setImmediate(() => {
      expect(historyMock.push.mock.calls.length).toBe(1);
      expect(historyMock.push.mock.calls[0][0]).toBe("/home");
    });
  });
});
