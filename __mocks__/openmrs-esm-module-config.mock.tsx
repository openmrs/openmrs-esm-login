import React from "react";

export function defineConfigSchema() {}

export function useConfig() {
  return { logo: {} };
}

export const ModuleNameContext = React.createContext("fake-module-config");
