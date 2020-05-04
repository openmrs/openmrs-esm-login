import React from "react";
import { always } from "kremling";
import { useConfig } from "@openmrs/esm-module-config";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { getCurrentUser } from "@openmrs/esm-api";
import { Trans } from "react-i18next";
import { setSessionLocation } from "./choose-location.resource";
import navigate from "../navigate";
import styles from "../styles.css";

export default function ChooseLocation(props: ChooseLocationProps) {
  const config = useConfig();
  const [location, setLocation] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const locationInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  const [currentUser, setCurrentUser] = React.useState(null);

  React.useEffect(() => {
    getCurrentUser().subscribe((user) => {
      setCurrentUser(user ? user.display : currentUser);
    }, createErrorHandler());
  });

  React.useEffect(() => {
    const abortController = new AbortController();
    if (isSubmitting) {
      setSessionLocation(location, abortController)
        .then(() => {
          if (
            props.location &&
            props.location.state &&
            props.location.state.referrer
          ) {
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

  const RadioInput = (option: RadioInputOption) => (
    <React.Fragment key={option.uuid}>
      <div className="omrs-radio-button">
        <input
          id={option.uuid}
          type="radio"
          name="location"
          value={option.uuid}
          onChange={(evt) => setLocation(evt.target.value)}
          ref={locationInputRef}
        />
        <label htmlFor={option.uuid} className={`omrs-padding-4`}>
          {option.display}
        </label>
      </div>
    </React.Fragment>
  );

  return (
    <div className={`canvas ${styles["container"]}`}>
      <h1 className={styles["welcome-msg"]}>
        <Trans i18nKey="welcome">Welcome</Trans>&nbsp;
        {currentUser}
      </h1>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className={`${styles["location-card"]} omrs-card`}>
          <CardHeader>
            <Trans i18nKey="location">Location</Trans>
          </CardHeader>
          <div className={styles["location-radio-group"]}>
            {props.loginLocations.map(RadioInput)}
          </div>
          <div className={styles["center"]}>
            <p className={styles["error-msg"]}>{errorMessage}</p>
          </div>
        </div>
        <div className={styles["center"]}>
          <button
            className={always(
              `omrs-margin-16 omrs-btn omrs-rounded ${styles["location-submit-btn"]}`
            ).toggle("omrs-filled-disabled", "omrs-filled-action", !location)}
            type="submit"
            disabled={!location}
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
  uuid: string;
  display: string;
};
