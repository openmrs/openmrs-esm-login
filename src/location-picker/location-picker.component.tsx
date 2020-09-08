import React, { useEffect, useRef, useCallback } from "react";
import { always } from "kremling";
import { debounce, isEmpty } from "lodash";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { Trans } from "react-i18next";
import { LocationEntry } from "../types";
import { useCurrentUser } from "../CurrentUserContext";
import styles from "../styles.css";

const CardHeader: React.FC = (props) => (
  <div className={styles["card-header"]}>
    <h2 className={`omrs-margin-8 omrs-margin-left-12`}>{props.children}</h2>
  </div>
);

interface RadioInputProps {
  option: LocationEntry;
  current: string;
  changeLocationData: (data: Partial<LocationDataState>) => void;
}

const RadioInput: React.FC<RadioInputProps> = ({
  option,
  current,
  changeLocationData,
}) => (
  <div className="omrs-radio-button">
    <input
      id={option.resource.id}
      type="radio"
      name="location"
      value={option.resource.id}
      checked={current === option.resource.id}
      onChange={(evt) =>
        changeLocationData({ activeLocation: evt.target.value })
      }
    />
    <label htmlFor={option.resource.id} className="omrs-padding-4">
      {option.resource.name}
    </label>
  </div>
);

interface LocationDataState {
  activeLocation: string;
  locationResult: Array<LocationEntry>;
}

interface LocationPickerProps {
  currentUser: string;
  loginLocations: Array<LocationEntry>;
  onChangeLocation(locationUuid: string): void;
  searchLocations(query: string): Promise<Array<LocationEntry>>;
  hideWelcomeMessage?: boolean;
  currentLocationUuid?: string;
}

const LocationPicker: React.FC<LocationPickerProps> = (props) => {
  const userDefaultLoginLocation: string = "userDefaultLoginLocationKey";
  const getDefaultUserLoginLocation = (): string => {
    const userLocation = window.localStorage.getItem(
      `${userDefaultLoginLocation}${props.currentUser}`
    );
    const isValidLocation = props.loginLocations.some(
      (location) => location.resource.id === userLocation
    );
    return isValidLocation ? userLocation : "";
  };
  const [locationData, setLocationData] = React.useState<LocationDataState>({
    activeLocation: getDefaultUserLoginLocation() ?? "",
    locationResult: props.loginLocations,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = useRef();

  const searchTimeout = 300;

  const autoFocusSearchInput = useCallback(
    (el: HTMLInputElement) => (el ? el.focus() : null),
    []
  );

  React.useEffect(() => {
    if (isSubmitting) {
      props.onChangeLocation(locationData.activeLocation);
      setIsSubmitting(false);
    }
  }, [isSubmitting, locationData]);

  React.useEffect(() => {
    const ac = new AbortController();

    if (props.loginLocations.length > 100) {
      if (searchTerm) {
        props.searchLocations(searchTerm).then((locationResult) => {
          changeLocationData({
            locationResult,
          });
        }, createErrorHandler());
      }
    } else if (searchTerm) {
      filterList(searchTerm);
    } else if (props.loginLocations !== locationData.locationResult) {
      changeLocationData({ locationResult: props.loginLocations });
    }

    return () => ac.abort();
  }, [searchTerm, props.loginLocations]);

  const search = debounce((location: string) => {
    clearSelectedLocation();
    setSearchTerm(location);
  }, searchTimeout);

  const filterList = (searchTerm: string) => {
    if (searchTerm) {
      const updatedList = props.loginLocations.filter((item) => {
        return (
          item.resource.name.toLowerCase().search(searchTerm.toLowerCase()) !==
          -1
        );
      });

      changeLocationData({ locationResult: updatedList });
    }
  };

  const changeLocationData = (data: Partial<LocationDataState>) => {
    if (data) {
      setLocationData((prevState) => ({
        ...prevState,
        ...data,
      }));
    }
  };

  const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setIsSubmitting(true);
  };

  useEffect(() => {
    if (locationData.activeLocation) {
      window.localStorage.setItem(
        `${userDefaultLoginLocation}${props.currentUser}`,
        locationData.activeLocation
      );
    }
  }, [locationData.activeLocation, props.currentUser]);

  useEffect(() => {
    if (props.currentLocationUuid && props.hideWelcomeMessage) {
      setLocationData((prevState) => ({
        ...prevState,
        ...{
          activeLocation: props.currentLocationUuid,
          locationResult: prevState.locationResult,
        },
      }));
    }
  }, []);

  useEffect(() => {
    if (isSubmitting && inputRef.current) {
      let searchInput: HTMLInputElement = inputRef.current;
      searchInput.value = "";
      setSearchTerm(null);
    }
  }, [isSubmitting]);

  const clearSelectedLocation = (): void => {
    setLocationData((prevState) => ({
      activeLocation: "",
      locationResult: prevState.locationResult,
    }));
  };

  return (
    <div className={`canvas ${styles["container"]}`}>
      {!props.hideWelcomeMessage && (
        <h1 className={styles["welcome-msg"]}>
          <Trans i18nKey="welcome">Welcome</Trans> {props.currentUser}
        </h1>
      )}
      <form onSubmit={handleSubmit}>
        <div className={`${styles["location-card"]} omrs-card`}>
          {!props.hideWelcomeMessage && (
            <CardHeader>
              <Trans i18nKey="location">Location</Trans>
            </CardHeader>
          )}
          <div className="omrs-input-group omrs-padding-12">
            <input
              className="omrs-input-underlined"
              placeholder="Search for location"
              aria-label="Search for location"
              onChange={(ev) => search(ev.target.value)}
              ref={autoFocusSearchInput}
            />
          </div>
          {!isEmpty(locationData.locationResult) && (
            <div className={styles["location-radio-group"]}>
              {locationData.locationResult.map((entry) => (
                <RadioInput
                  key={entry.resource.id}
                  current={locationData.activeLocation}
                  option={entry}
                  changeLocationData={changeLocationData}
                />
              ))}
            </div>
          )}
          {locationData.locationResult.length === 0 && (
            <p className="omrs-type-body-regular omrs-padding-8">
              <Trans i18nKey="locationNotFound">
                Sorry, no location has been found
              </Trans>
            </p>
          )}
          <div className={styles["center"]}>
            <p className={styles["error-msg"]} />
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
};

export default LocationPicker;
