import { getAsyncLifecycle, defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";
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

  defineConfigSchema(moduleName, configSchema);

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
      {
        id: "location-changer",
        slot: "user-panel-slot",
        load: getAsyncLifecycle(
          () => import("./change-location-link/change-location-link.component"),
          options
        ),
      },
    ],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS };
