import React from "react";
import { performLogin } from "./login.resource";
import { always } from "kremling";
import styles from "./login.component.css";
import { getCurrentUser } from "@openmrs/esm-api";
import { useConfig } from "@openmrs/esm-module-config";
import { Trans } from "react-i18next";

export default function Login(props: LoginProps) {
  const config = useConfig();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authenticated, setAuthenticated] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [checkingIfLoggedIn, setCheckingIfLogged] = React.useState(true);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (checkingIfLoggedIn) {
      const subscription = getCurrentUser({
        includeAuthStatus: true
      }).subscribe(
        authResult => {
          setCheckingIfLogged(false);
          if (authResult.authenticated) {
            navigate(props, config.links.loginSuccess);
          }
        },
        err => {
          setCheckingIfLogged(false);
          throw err;
        }
      );

      return () => subscription.unsubscribe();
    }
  }, [checkingIfLoggedIn]);

  React.useEffect(() => {
    if (isLoggingIn) {
      performLogin(username, password)
        .then(data => {
          const authData = data["data"];
          if (authData) {
            const { authenticated } = authData;
            if (authenticated) {
              navigate(props, config.links.loginSuccess);
            } else {
              setAuthenticated(authenticated);
              setErrorMessage("Incorrect username or password");
              passwordInputRef.current.focus();
            }
          }
        })
        .catch(error => setErrorMessage(error.message))
        .then(() => {
          setIsLoggingIn(false);
        });
    }
  }, [isLoggingIn]);

  React.useEffect(() => {
    if (
      document.activeElement !== usernameInputRef.current &&
      !checkingIfLoggedIn
    ) {
      passwordInputRef.current.focus();
    }
  }, [showPassword, passwordInputRef.current, usernameInputRef.current]);

  if (checkingIfLoggedIn) {
    return null;
  }

  const logo = config.logo.src ? (
    <img
      src={config.logo.src}
      alt={config.logo.alt}
      className={styles["logo-img"]}
    />
  ) : (
    <svg role="img" className={styles["logo"]}>
      <use xlinkHref="#omrs-logo-full-color"></use>
    </svg>
  );
  return (
    <div className={`canvas ${styles["container"]}`}>
      <div className={`omrs-card ${styles["login-card"]}`}>
        <div className={styles["center"]}>{logo}</div>
        <form onSubmit={handleSubmit} ref={formRef}>
          <div className="omrs-input-group">
            <input
              id="username"
              className={always("omrs-input-outlined").maybe(
                "omrs-input-danger",
                authenticated === false
              )}
              type="text"
              name="username"
              value={username}
              onChange={evt => setUsername(evt.target.value)}
              ref={usernameInputRef}
              autoFocus
              required
            />
            <label htmlFor="username">
              <Trans i18nKey="username">Username</Trans>
            </label>
          </div>
          <div className="omrs-input-group">
            <input
              id="password"
              className={always("omrs-input-outlined").maybe(
                "omrs-input-danger",
                authenticated === false
              )}
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={evt => setPassword(evt.target.value)}
              ref={passwordInputRef}
              required
            />
            <label htmlFor="password">
              <Trans i18nKey="password">Password</Trans>
            </label>
            <button
              className={`omrs-unstyled ${styles["icon-btn"]}`}
              type="button"
              aria-label="Toggle view password text"
              onClick={() => setShowPassword(!showPassword)}
            >
              <svg className="omrs-icon" role="img">
                <use xlinkHref="#omrs-icon-visibility" />
              </svg>
            </button>
          </div>
          <div className={styles["center"]}>
            <p className={styles["error-msg"]}>{errorMessage}</p>
          </div>
          <div>
            <button
              className={always(
                `omrs-margin-top-24 omrs-btn omrs-btn-lg ${styles["submit-btn"]}`
              ).toggle(
                "omrs-filled-disabled",
                "omrs-filled-action",
                !password || !username
              )}
              type="submit"
              disabled={!password || !username}
            >
              Login
            </button>
          </div>
        </form>
      </div>
      <div className="omrs-margin-top-32">
        <p className={styles["powered-by-txt"]}>Powered by</p>
        <div>
          <svg role="img" className={styles["powered-by-logo"]}>
            <use xlinkHref="#omrs-logo-partial-mono"></use>
          </svg>
        </div>
      </div>
    </div>
  );

  function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setIsLoggingIn(true);
  }
}

function navigate(props, urlConfig: UrlConfig) {
  if (urlConfig.spa) {
    props.history.push(urlConfig.url);
  } else {
    window.location.href = urlConfig.url;
  }
}

type LoginProps = {
  history?: {
    push(newUrl: String): void;
  };
};

type UrlConfig = {
  spa: boolean;
  url: string;
};
