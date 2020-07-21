import React from "react";
import Loading from "../loading/loading.component";
import LocationPicker from "../location-picker/location-picker.component";
import { History } from "history";
import { RouteComponentProps } from "react-router-dom";
import { useConfig } from "@openmrs/esm-module-config";
import { setSessionLocation, queryLocations } from "./choose-location.resource";
import { useCurrentUser } from "../CurrentUserContext";
import { LocationEntry } from "../types";

const absoluteUrlRegex = new RegExp("^(?:[a-z]+:)?//", "i");

declare global {
  interface Window {
    openmrsBase: string;
  }
}

function navigate(history: History, spa: boolean, url: string) {
  if (spa) {
    history.push(url);
  } else if (!spa && !url.match(absoluteUrlRegex)) {
    window.location.href = window.openmrsBase + url;
  } else {
    window.location.href = url;
  }
}

export interface LoginReferrer {
  referrer?: string;
}

export interface ChooseLocationProps
  extends RouteComponentProps<{}, undefined, LoginReferrer> {}

export const ChooseLocation: React.FC<ChooseLocationProps> = (props) => {
  const referrer = props.location?.state?.referrer;
  const config = useConfig();
  const user = useCurrentUser();
  const [loginLocations, setLoginLocations] = React.useState<
    Array<LocationEntry>
  >(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const changeLocation = React.useCallback(
    (locationUuid?: string) => {
      const sessionDefined = locationUuid
        ? setSessionLocation(locationUuid, new AbortController())
        : Promise.resolve();

      sessionDefined.then(() => {
        if (referrer && referrer !== "/") {
          props.history.push(referrer);
        } else {
          navigate(
            props.history,
            config.links.loginSuccess.spa,
            config.links.loginSuccess.url
          );
        }
      });
    },
    [
      referrer,
      config.links.loginSuccess.spa,
      config.links.loginSuccess.url,
      props.history,
    ]
  );

  React.useEffect(() => {
    const ac = new AbortController();
    queryLocations("", ac).then((locations) => setLoginLocations(locations));
    return () => ac.abort();
  }, []);

  React.useEffect(() => {
    if (loginLocations) {
      if (!config.chooseLocation.enabled || loginLocations.length < 2) {
        changeLocation(loginLocations[0]?.resource.id);
      } else {
        setIsLoading(false);
      }
    }
  }, [loginLocations, user, changeLocation, config.chooseLocation.enabled]);

  if (!isLoading) {
    return (
      <LocationPicker
        currentUser={user.display}
        loginLocations={loginLocations}
        onChangeLocation={changeLocation}
        searchLocations={queryLocations}
      />
    );
  }

  return <Loading />;
};

export default ChooseLocation;
