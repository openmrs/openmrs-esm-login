import React from "react";

export const openmrsComponentDecorator = jest
  .fn()
  .mockImplementation(() => (f) => f);

export const config = {
  chooseLocation: {
    enabled: true,
  },
  logo: {
    src: null,
    alt: "Logo",
  },
  links: {
    loginSuccess: "${openmrsSpaBase}/home",
  },
};

export function useConfig() {
  return config;
}

export const ComponentContext = React.createContext({
  moduleName: "fake-module-config",
});
