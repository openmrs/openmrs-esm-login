import { getAsyncLifecycle } from "@openmrs/esm-react-utils";
import { defineConfigSchema, validators, Type } from "@openmrs/esm-config";
import { backendDependencies } from "./openmrs-backend-dependencies";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  const moduleName = "@openmrs/esm-login-app";

  const options = {
    featureName: "login",
    moduleName,
  };

  defineConfigSchema(moduleName, {
    chooseLocation: {
      enabled: {
        _type: Type.Boolean,
        _default: true,
        _description:
          "Whether to show a 'Choose Location' screen after login. " +
          "If true, the user will be taken to the loginSuccess URL after they " +
          "choose a location.",
      },
    },
    links: {
      loginSuccess: {
        _type: Type.String,
        _description: "Where to take the user after they are logged in.",
        _default: "${openmrsSpaBase}/home",
        _validators: [validators.isUrl],
      },
    },
    logo: {
      src: {
        _type: Type.String,
        _default: null,
        _description:
          "A path or URL to an image. Defaults to the OpenMRS SVG sprite.",
      },
      alt: {
        _type: Type.String,
        _default: "Logo",
        _description: "Alt text, shown on hover",
      },
    },
  });

  return {
    lifecycle: getAsyncLifecycle(() => import("./root.component"), options),
    activate: "login",
    extensions: [
      {
        id: "location-picker",
        slot: "location-picker",
        load: getAsyncLifecycle(
          () => import("./location-picker/location-picker.component"),
          options
        ),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
