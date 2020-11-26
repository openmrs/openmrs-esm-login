export function defineConfigSchema() {}

export const validators = {
  isBoolean: jest.fn(),
  isString: jest.fn(),
};

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
