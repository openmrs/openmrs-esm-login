import { openmrsFetch } from "@openmrs/esm-framework";

export function getCurrentSession(abortController: AbortController) {
  return openmrsFetch(`/ws/rest/v1/appui/session`, {
    signal: abortController.signal,
  });
}
