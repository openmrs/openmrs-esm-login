import React from "react";
import { always } from "kremling";
import { useConfig } from "@openmrs/esm-module-config";
import { createErrorHandler } from "@openmrs/esm-error-handling";
import { Trans } from "react-i18next";
import { setSessionLocation } from "./choose-location.resource";
import styles from "../styles.css";

export default function ChooseLocation(props: ChooseLocationProps) {
  const config = useConfig();
  const [location, setLocation] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const locationInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    const abortController = new AbortController();
    if (isSubmitting) {
      setSessionLocation(location, abortController)
        .then(data => {
          navigate(props, config.links.loginSuccess);
        })
        .catch(createErrorHandler());
    }
    return () => abortController.abort();
  }, [isSubmitting]);

  const RadioInput = (option: RadioInputOption) => (
    <React.Fragment key={option.uuid}>
      <div className="omrs-radio-button">
        <label>
          <input
            type="radio"
            name="location"
            value={option.uuid}
            onChange={evt => setLocation(evt.target.value)}
            ref={locationInputRef}
            className={`omrs-margin-8`}
          />
          <span>{option.display}</span>
        </label>
      </div>
    </React.Fragment>
  );

  return (
    <div className={`canvas ${styles["container"]}`}>
      <h1>
        <Trans i18nKey="welcome">Welcome!</Trans>
      </h1>
      <form onSubmit={handleSubmit} ref={formRef}>
        <div className={`omrs-card ${styles.card}`}>
          <CardHeader>
            <Trans i18nKey="location">Location</Trans>
          </CardHeader>
          <div className={styles["card-content"]}>
            {props.loginLocations.map(RadioInput)}
          </div>
          <div className={styles["center"]}>
            <p className={styles["error-msg"]}>{errorMessage}</p>
          </div>
        </div>
        <div>
          <button
            className={always(
              `omrs-margin-16 omrs-btn omrs-rounded omrs-btn-lg ${styles["location-submit-btn"]}`
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

const CardHeader: React.FunctionComponent = props => (
  <div className={styles["card-header"]}>
    <h2 className={`omrs-margin-8 omrs-margin-left-12`}>{props.children}</h2>
  </div>
);

type ChooseLocationProps = {
  history?: {
    push(newUrl: String): void;
  };
  loginLocations: Array<RadioInputOption>;
};

function navigate(props, urlConfig: UrlConfig) {
  if (urlConfig.spa) {
    props.history.push(urlConfig.url);
  } else {
    window.location.href = urlConfig.url;
  }
}

type UrlConfig = {
  spa: boolean;
  url: string;
};

type RadioInputOption = {
  uuid: string;
  display: string;
};
