import React from "react";
import { navigateToUrl } from "single-spa";

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
    alt: "Logo",
  },
  links: {
    loginSuccess: "${openmrsSpaBase}/home",
  },
};

export function useConfig() {
  return config;
}

export const navigate = jest.fn();

export const Type = {
  Array: "Array",
  Boolean: "Boolean",
  ConceptUuid: "ConceptUuid",
  Number: "Number",
  Object: "Object",
  String: "String",
  UUID: "UUID",
};

export const ModuleNameContext = React.createContext("fake-module-config");
