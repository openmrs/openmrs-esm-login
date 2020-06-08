import "./set-public-path";
import { backendDependencies } from "./openmrs-backend-dependencies";

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

export { backendDependencies, importTranslation, setupOpenMRS };
