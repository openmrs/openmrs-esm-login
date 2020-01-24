import { openmrsFetch, openmrsObservableFetch } from "@openmrs/esm-api";
import { map } from "rxjs/operators";

export function getLoginLocations(): Observable<Object[]> {
  return openmrsObservableFetch(
    `/ws/rest/v1/location?tag=Login%20Location&v=custom:(uuid,display)`
  ).pipe(map(({ data }) => data["results"]));
}

export function setSessionLocation(
  locationUuid: string,
  abortController: AbortController
): Promise<any> {
  return openmrsFetch("/ws/rest/v1/appui/session", {
    method: "POST",
    body: { location: locationUuid },
    headers: {
      "Content-Type": "application/json"
    },
    signal: abortController.signal
  });
}
