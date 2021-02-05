import React from "react";
import { always } from "kremling";
import { debounce, isEmpty } from "lodash";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { Trans } from "react-i18next";
import { LocationEntry } from "../types";
import styles from "./location-picker.component.scss";

const CardHeader: React.FC = (props) => (
  <div className={styles["card-header"]}>
    <h3 className={`omrs-margin-8 omrs-margin-left-12`}>{props.children}</h3>
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

const LocationPicker: React.FC<LocationPickerProps> = ({
  currentUser,
  loginLocations,
  onChangeLocation,
  searchLocations,
  hideWelcomeMessage,
  currentLocationUuid,
}) => {
  const userDefaultLoginLocation: string = "userDefaultLoginLocationKey";
  const getDefaultUserLoginLocation = (): string => {
    const userLocation = window.localStorage.getItem(
      `${userDefaultLoginLocation}${currentUser}`
    );
    const isValidLocation = loginLocations.some(
      (location) => location.resource.id === userLocation
    );
    return isValidLocation ? userLocation : "";
  };
  const [locationData, setLocationData] = React.useState<LocationDataState>({
    activeLocation: getDefaultUserLoginLocation() ?? "",
    locationResult: loginLocations,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const inputRef = React.useRef();

  const searchTimeout = 300;

  const autoFocusSearchInput = React.useCallback(
    (el: HTMLInputElement) => (el ? el.focus() : null),
    []
  );

  React.useEffect(() => {
    if (isSubmitting) {
      onChangeLocation(locationData.activeLocation);
      setIsSubmitting(false);
    }
  }, [isSubmitting, locationData, onChangeLocation]);

  React.useEffect(() => {
    const ac = new AbortController();

    if (loginLocations.length > 100) {
      if (searchTerm) {
        searchLocations(searchTerm).then((locationResult) => {
          changeLocationData({
            locationResult,
          });
        }, createErrorHandler());
      }
    } else if (searchTerm) {
      filterList(searchTerm);
    } else if (loginLocations !== locationData.locationResult) {
      changeLocationData({ locationResult: loginLocations });
    }

    return () => ac.abort();
  }, [searchTerm, loginLocations]);

  const search = debounce((location: string) => {
    clearSelectedLocation();
    setSearchTerm(location);
  }, searchTimeout);

  const filterList = (searchTerm: string) => {
    if (searchTerm) {
      const updatedList = loginLocations.filter((item) => {
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

  React.useEffect(() => {
    if (locationData.activeLocation) {
      window.localStorage.setItem(
        `${userDefaultLoginLocation}${currentUser}`,
        locationData.activeLocation
      );
    }
  }, [locationData.activeLocation, currentUser]);

  React.useEffect(() => {
    if (currentLocationUuid && hideWelcomeMessage) {
      setLocationData((prevState) => ({
        ...prevState,
        ...{
          activeLocation: currentLocationUuid,
          locationResult: prevState.locationResult,
        },
      }));
    }
  }, [currentLocationUuid, hideWelcomeMessage]);

  React.useEffect(() => {
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
    <div className={`canvas ${styles["locationPickerContainer"]}`}>
      {!hideWelcomeMessage && (
        <h2 className={styles["welcome-msg"]}>
          <Trans i18nKey="welcome">Welcome</Trans> {currentUser}
        </h2>
      )}
      <form onSubmit={handleSubmit}>
        <div className={`${styles["location-card"]} omrs-card`}>
          {!hideWelcomeMessage && (
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
