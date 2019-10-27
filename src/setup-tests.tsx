import Enzyme from "enzyme";
import Adapter from "enzyme-adapter-react-16";

// @ts-ignore
Enzyme.configure({ adapter: new Adapter() });

window.System = {
  import: jest
    .fn()
    .mockRejectedValue(new Error("config.json not available in import map")),
  resolve: jest.fn().mockImplementation(() => {
    throw new Error("config.json not available in import map");
  }),
  register: jest.fn()
};
