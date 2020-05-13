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
      "Content-Type": "application/json",
    },
    signal: abortController.signal,
  });
}

export interface LocationResponse {
  type: string;
  total: number;
  resourceType: string;
  meta: {
    lastUpdated: string;
  };
  link: Array<{
    relation: string;
    url: string;
  }>;
  id: string;
  entry: Array<LocationEntry>;
}

export interface LocationEntry {
  resource: Resource;
}

export interface Resource {
  id: string;
  name: string;
  resourceType: string;
  status: "active" | "inactive";
  meta?: {
    tag?: Array<{
      code: string;
      display: string;
      system: string;
    }>;
  };
}

export function searchLocationsFhir(location: string) {
  return openmrsFetch<LocationResponse>(`/ws/fhir2/Location?name=${location}`, {
    method: "GET",
  });
}
