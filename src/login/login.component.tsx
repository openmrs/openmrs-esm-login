import React from "react";
import { performLogin } from "./login.resource";
import { always } from "kremling";
import styles from "./login.component.css";
import { getCurrentUser } from "@openmrs/esm-api";

export default function Login(props: LoginProps) {
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
            props.history.push("/home");
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
              props.history.push("/home");
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

  return (
    <div className={`canvas ${styles["container"]}`}>
      <div className={`omrs-card ${styles["login-card"]}`}>
        <div className={styles["center"]}>
          <svg role="img" className={styles["logo"]}>
            <use xlinkHref="#omrs-logo-full-color"></use>
          </svg>
        </div>
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
            <label htmlFor="username">Username</label>
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
            <label htmlFor="password">Password</label>
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

type LoginProps = {
  history?: {
    push(newUrl: String): void;
  };
};
