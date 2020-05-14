import React from "react";

export function defineConfigSchema() {}

export const validators = {
  isBoolean: jest.fn(),
  isString: jest.fn(),
};

export const config = {
  chooseLocation: {
    enabled: true,
  },
  logo: {
    src: null,
  },
  links: {
    loginSuccess: {
      url: "/home",
      spa: true,
    },
  },
};

export function useConfig() {
  return config;
}

export const ModuleNameContext = React.createContext("fake-module-config");
