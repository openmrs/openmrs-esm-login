import { of } from "rxjs";

export function openmrsFetch() {
  return new Promise(() => {});
}

export function getCurrentUser() {
  return of({ authenticated: false });
}
