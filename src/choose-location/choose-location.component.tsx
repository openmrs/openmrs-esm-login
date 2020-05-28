import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { useConfig } from "@openmrs/esm-module-config";
import { getCurrentUser } from "@openmrs/esm-api";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { setSessionLocation, queryLocations } from "./choose-location.resource";
import { LocationEntry } from "../types";
import LocationPicker from "../location-picker/location-picker.component";
import navigate from "../navigate";

interface LoginReferrer {
  referrer?: string;
}

interface ChooseLocationProps
  extends RouteComponentProps<{}, undefined, LoginReferrer> {}

export default function ChooseLocation(props: ChooseLocationProps) {
  const referrer = props.location?.state?.referrer;

  const config = useConfig();
  const [loginLocations, setLoginLocations] = React.useState<
    Array<LocationEntry>
  >(null);
  const [currentUser, setCurrentUser] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const changeLocation = React.useCallback(
    (locationUuid?: string) => {
      const sessionDefined = locationUuid
        ? setSessionLocation(locationUuid, new AbortController())
        : Promise.resolve();

      sessionDefined
        .then(() => {
          if (referrer) {
            props.history.push(referrer);
          } else {
            navigate(
              props,
              config.links.loginSuccess.spa,
              config.links.loginSuccess.url
            );
          }
        })
        .catch(createErrorHandler());
    },
    [referrer]
  );

  React.useEffect(() => {
    const ac = new AbortController();
    const sub = getCurrentUser().subscribe((user) => {
      if (user) {
        setCurrentUser(user.display);
      }
    }, createErrorHandler());

    queryLocations("", ac).then(
      (locations) => setLoginLocations(locations),
      createErrorHandler()
    );

    return () => {
      ac.abort();
      sub.unsubscribe();
    };
  }, []);

  React.useEffect(() => {
    if (loginLocations && currentUser) {
      if (!config.chooseLocation.enabled || loginLocations.length < 2) {
        changeLocation(loginLocations[0]?.resource.id);
      } else {
        setIsLoading(false);
      }
    }
  }, [loginLocations, currentUser, changeLocation]);

  if (!isLoading) {
    return (
      <LocationPicker
        currentUser={currentUser}
        loginLocations={loginLocations}
        onChangeLocation={changeLocation}
        searchLocations={queryLocations}
      />
    );
  }

  return <div>Loading ...</div>;
}
