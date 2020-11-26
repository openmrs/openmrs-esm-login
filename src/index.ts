import "./set-public-path";
import { getAsyncLifecycle } from "@openmrs/esm-react-utils";
import { backendDependencies } from "./openmrs-backend-dependencies";
import * as LocationPickerParcel from "./location-picker-parcel.component";

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

function setupOpenMRS() {
  return {
    lifecycle: getAsyncLifecycle(() => import("./root.component"), {
      featureName: "login",
      moduleName: "@openmrs/esm-login-app",
    }),
    activate: "login",
  };
}

export {
  backendDependencies,
  importTranslation,
  setupOpenMRS,
  LocationPickerParcel,
};
