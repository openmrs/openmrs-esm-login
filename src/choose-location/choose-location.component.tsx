import React from "react";
import { always } from "kremling";
import { useConfig } from "@openmrs/esm-module-config";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { getCurrentUser } from "@openmrs/esm-api";
import { Trans } from "react-i18next";
import {
  setSessionLocation,
  searchLocationsFhir,
  LocationEntry,
} from "./choose-location.resource";
import navigate from "../navigate";
import styles from "../styles.css";
import { debounce, isEmpty } from "lodash";
import { RouteComponentProps, StaticContext } from "react-router";

interface LoginReferrer {
  referrer?: string;
}

interface ChooseLocationProps
  extends RouteComponentProps<{}, StaticContext, LoginReferrer> {}

export default function ChooseLocation(props: ChooseLocationProps) {
  const config = useConfig();
  const [loginLocations, setLoginLocations] = React.useState<
    Array<LocationEntry>
  >(undefined);
  const [loading, setLoading] = React.useState(true);

  const changeLocation = (locationUuid?: string) => {
    const sessionDefined = locationUuid
      ? setSessionLocation(locationUuid, new AbortController())
      : Promise.resolve();

    sessionDefined
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
  };

  React.useEffect(() => {
    const ac = new AbortController();

    searchLocationsFhir("").then(
      (locations) => setLoginLocations(locations.data.entry),
      createErrorHandler()
    );

    return () => ac.abort();
  }, []);

  React.useEffect(() => {
    if (loginLocations) {
      if (!config.chooseLocation.enabled || loginLocations.length < 1) {
        changeLocation(loginLocations[0]?.resource.id);
      } else {
        setLoading(false);
      }
    }
  }, [loginLocations]);

  if (!loading) {
    return (
      <LocationPicker
        loginLocations={loginLocations}
        onChangeLocation={changeLocation}
      />
    );
  }

  return <div>Loading ...</div>;
}

interface LocationPickerProps {
  loginLocations: Array<LocationEntry>;
  onChangeLocation(locationUuid: string): void;
}

interface LocationDataState {
  activeLocation: string;
  locationResult: Array<LocationEntry>;
}

const LocationPicker: React.FC<LocationPickerProps> = (props) => {
  const [locationData, setLocationData] = React.useState<LocationDataState>({
    activeLocation: "",
    locationResult: props.loginLocations,
  });
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [currentUser, setCurrentUser] = React.useState(null);

  const searchTimeout = 300;

  React.useEffect(() => {
    getCurrentUser().subscribe((user) => {
      setCurrentUser(user ? user.display : currentUser);
    }, createErrorHandler());
  });

  React.useEffect(() => {
    const ac = new AbortController();

    if (isSubmitting) {
      props.onChangeLocation(locationData.activeLocation);
    }

    return () => ac.abort();
  }, [isSubmitting]);

  React.useEffect(() => {
    const ac = new AbortController();

    if (props.loginLocations.length > 100) {
      if (searchTerm) {
        searchLocationsFhir(searchTerm).then((locs) => {
          changeLocationData({
            locationResult: locs.data.entry,
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

  const search = debounce(
    (location: string) => setSearchTerm(location),
    searchTimeout
  );

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

  return (
    <div className={`canvas ${styles["container"]}`}>
      <h1 className={styles["welcome-msg"]}>
        <Trans i18nKey="welcome">Welcome</Trans> {currentUser}
      </h1>
      <form onSubmit={handleSubmit}>
        <div className={`${styles["location-card"]} omrs-card`}>
          <CardHeader>
            <Trans i18nKey="location">Location</Trans>
          </CardHeader>
          <div className="omrs-input-group omrs-padding-12">
            <input
              className="omrs-input-underlined"
              placeholder="Search for location"
              aria-label="Search for location"
              onChange={($event) => search($event.target.value)}
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
