import "./set-public-path";
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
    lifecycle: () => import("./openmrs-esm-login"),
    activate: "login",
  };
}

export {
  backendDependencies,
  importTranslation,
  setupOpenMRS,
  LocationPickerParcel,
};
