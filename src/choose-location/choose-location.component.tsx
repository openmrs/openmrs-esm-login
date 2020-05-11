import React from "react";
import { always } from "kremling";
import { useConfig } from "@openmrs/esm-module-config";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { getCurrentUser } from "@openmrs/esm-api";
import { Trans } from "react-i18next";
import {
  setSessionLocation,
  searchLocationsFhir,
} from "./choose-location.resource";
import navigate from "../navigate";
import styles from "../styles.css";
import { debounce, isEmpty } from "lodash";

export default function ChooseLocation(props: ChooseLocationProps) {
  const config = useConfig();
  const [locationData, setLocationData] = React.useState({
    activeLocation: "",
    locationResult: [],
    emptyResult: false,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const locationInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [currentUser, setCurrentUser] = React.useState(null);
  const searchTimeout = 300;
  React.useEffect(() => {
    getCurrentUser().subscribe((user) => {
      setCurrentUser(user ? user.display : currentUser);
    }, createErrorHandler());
  });

  React.useEffect(() => {
    const abortController = new AbortController();
    if (isSubmitting) {
      setSessionLocation(locationData.activeLocation, abortController)
        .then(() => {
          if (props.location?.state?.referrer) {
            props.history.push(props.location.state.referrer);
          } else {
            navigate(
              props,
              config.links.loginSuccess.spa,
              config.links.loginSuccess.url
            );
          }
        })
        .catch(createErrorHandler());
    }
    return () => abortController.abort();
  }, [isSubmitting]);
  React.useEffect(() => {
    const ac = new AbortController();
    changeLocationData({ locationResult: props.loginLocations });
    if (props.loginLocations.length > 100) {
      if (searchTerm) {
        searchLocationsFhir(searchTerm).then((locs) => {
          changeLocationData({ locationResult: locs.data.entry });
          if (isEmpty(locs.data.entry)) {
            changeLocationData({ emptyResult: true });
          } else {
            changeLocationData({ emptyResult: false });
          }
        }, createErrorHandler());
      }
    } else if (searchTerm) {
      filterList(searchTerm);
    } else {
      changeLocationData({ emptyResult: false });
      changeLocationData({ locationResult: props.loginLocations });
    }
    return () => ac.abort();
  }, [searchTerm, props.loginLocations]);

  const search = debounce((location) => {
    setSearchTerm(location);
  }, searchTimeout);

  const filterList = (searchTerm) => {
    if (searchTerm) {
      const updatedList = locationData.locationResult.filter((item) => {
        return (
          item.resource.name.toLowerCase().search(searchTerm.toLowerCase()) !==
          -1
        );
      });
      if (updatedList.length > 0) {
        changeLocationData({ locationResult: updatedList });
      } else {
        changeLocationData({ locationResult: updatedList });
        changeLocationData({ emptyResult: true });
      }
    }
  };

  const changeLocationData = (data) => {
    if (data) {
      setLocationData((prevState) => ({
        ...prevState,
        ...data,
      }));
    }
  };

  const RadioInput = (option: RadioInputOption) => (
    <React.Fragment key={option.resource.id}>
      <div className="omrs-radio-button">
        <input
          id={option.resource.id}
          type="radio"
          name="location"
          value={option.resource.id}
          onChange={(evt) =>
            changeLocationData({ activeLocation: evt.target.value })
          }
          ref={locationInputRef}
        />
        <label htmlFor={option.resource.id} className={`omrs-padding-4`}>
          {option.resource.name}
        </label>
      </div>
    </React.Fragment>
  );

  return (
    <div className={`canvas ${styles["container"]}`}>
      <h1 className={styles["welcome-msg"]}>
        <Trans i18nKey="welcome">Welcome</Trans> {currentUser}
      </h1>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className={`${styles["location-card"]} omrs-card`}>
          <CardHeader>
            <Trans i18nKey="location">Location</Trans>
          </CardHeader>
          <div className="omrs-input-group omrs-padding-12">
            <input
              className={`omrs-input-underlined`}
              placeholder="Search for location"
              aria-label="Search for location"
              onChange={($event) => search($event.target.value)}
            />
          </div>
          {!isEmpty(locationData.locationResult) && (
            <div className={styles["location-radio-group"]}>
              {locationData.locationResult.map(RadioInput)}
            </div>
          )}
          {locationData.emptyResult && (
            <p className={`omrs-type-body-regular omrs-padding-8`}>
              <Trans i18nKey="locationNotFound">
                Sorry, no location has been found
              </Trans>
            </p>
          )}
          <div className={styles["center"]}>
            <p className={styles["error-msg"]}>{errorMessage}</p>
          </div>
        </div>
        <div className={styles["center"]}>
          <button
            className={always(
              `omrs-margin-16 omrs-btn omrs-rounded ${styles["location-submit-btn"]}`
            ).toggle(
              "omrs-filled-disabled",
              "omrs-filled-action",
              !locationData.activeLocation
            )}
            type="submit"
            disabled={!locationData.activeLocation}
          >
            <Trans i18nKey="confirm">Confirm</Trans>
          </button>
        </div>
      </form>
    </div>
  );

  function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsSubmitting(true);
  }
}

const CardHeader: React.FunctionComponent = (props) => (
  <div className={styles["card-header"]}>
    <h2 className={`omrs-margin-8 omrs-margin-left-12`}>{props.children}</h2>
  </div>
);

type ChooseLocationProps = {
  location?: any;
  history?: {
    push(newUrl: String): void;
  };
  loginLocations: Array<RadioInputOption>;
};

type RadioInputOption = {
  resource: Resource;
};

type Resource = {
  id: string;
  name: string;
};
