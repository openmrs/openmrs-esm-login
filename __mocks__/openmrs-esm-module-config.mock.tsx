import React from "react";

export function defineConfigSchema() {}

export function useConfig() {
  return {
    chooseLocation: {
      enabled: true
    },
    logo: {
      src: null
    },
    links: {
      loginSuccess: {
        url: "/home",
        spa: true
      }
    }
  };
}

export const ModuleNameContext = React.createContext("fake-module-config");
