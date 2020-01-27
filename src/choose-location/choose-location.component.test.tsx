import "@testing-library/jest-dom";
import React from "react";
import { of } from "rxjs";
import { fireEvent, render, wait } from "@testing-library/react";
import ChooseLocation from "./choose-location.component";
import {
  getLoginLocations,
  setSessionLocation
} from "./choose-location.resource";

const historyMock = { push: jest.fn() };

jest.mock("./choose-location.resource");
const mockedGetLoginLocations = getLoginLocations as jest.Mock;
const mockedSetSessionLocation = setSessionLocation as jest.Mock;

mockedGetLoginLocations.mockReturnValue(
  of([{ uuid: "111", display: "Earth" }, { uuid: "222", display: "Mars" }])
);

describe(`<ChooseLocation />`, () => {
  let earthInput, marsInput, submitButton, wrapper;
  beforeEach(() => {
    // reset mocks
    mockedGetLoginLocations.mockReset();
    mockedSetSessionLocation.mockReset();
    mockedGetLoginLocations.mockReturnValue(
      of([{ uuid: "111", display: "Earth" }, { uuid: "222", display: "Mars" }])
    );
    mockedSetSessionLocation.mockResolvedValue({});
    historyMock.push.mockReset();
    // prepare components
    wrapper = render(<ChooseLocation history={historyMock} />);
    earthInput = wrapper.getByLabelText("Earth", { selector: "input" });
    marsInput = wrapper.getByLabelText("Mars", { selector: "input" });
    submitButton = wrapper.getByText("Confirm", { selector: "button" });
  });

  it(`disables/enables the submit button when input is invalid/valid`, () => {
    expect(submitButton).toHaveAttribute("disabled");
    fireEvent.click(marsInput);
    expect(submitButton).not.toHaveAttribute("disabled");
  });

  it(`makes an API request when you submit the form`, async () => {
    expect(setSessionLocation).not.toHaveBeenCalled();
    fireEvent.click(marsInput);
    fireEvent.click(submitButton);
    await wait(() => expect(setSessionLocation).toHaveBeenCalled());
  });

  it(`send the user to the target page on submit`, async () => {
    expect(setSessionLocation).not.toHaveBeenCalled();
    fireEvent.click(marsInput);
    fireEvent.click(submitButton);
    await wait(() => expect(historyMock.push.mock.calls.length).toBe(1));
    await wait(() => expect(historyMock.push.mock.calls[0][0]).toBe("/home"));
  });
});
