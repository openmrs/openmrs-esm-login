import React from "react";

export function getConfig() {
  return { logo: { src: null, alt: "Logo" } };
}

export function defineConfigSchema(schema) {}

export const ModuleNameContext = React.createContext(null);
