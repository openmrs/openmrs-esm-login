import React from "react";

export const openmrsRootDecorator = jest
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

export const ModuleNameContext = React.createContext("fake-module-config");
