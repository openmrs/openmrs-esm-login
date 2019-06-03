import React from "react";
import { shallow } from "enzyme";
import Root from "./root.component";

describe(`<Root />`, () => {
  it(`renders without dying`, () => {
    const wrapper = shallow(<Root />);
  });
});
