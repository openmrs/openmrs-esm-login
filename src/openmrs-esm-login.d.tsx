// This entire file will be deleted once we have typescript definitions
// for @openmrs/esm-api published to npm
declare type Observable<T> = import("rxjs").Observable<T>;

declare module "@openmrs/esm-api" {
  export function openmrsFetch(url: string, fetchInit: any): any;
  export function getCurrentUser(opts: any): Observable<any>;
  export function userHasAccess(privilege: string, user: {}): boolean;
}

declare module "*.css";
