import React from "react";
import styles from "../styles.css";
import { RouteComponentProps } from "react-router-dom";
import { always } from "kremling";
import { Trans } from "react-i18next";
import { useConfig } from "@openmrs/esm-config";
import { performLogin } from "./login.resource";
import { useCurrentUser } from "../CurrentUserContext";

export interface LoginReferrer {
  referrer?: string;
}

export interface LoginProps
  extends RouteComponentProps<{}, undefined, LoginReferrer> {}

const Login: React.FC<LoginProps> = (props: LoginProps) => {
  const config = useConfig();
  const user = useCurrentUser();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (user) {
      props.history.push(
        "/login/location",
        props.location ? props.location.state : undefined
      );
    }
  }, [user, props.history, props.location]);

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    try {
      const loginRes = await performLogin(username, password);
      const authData = loginRes.data;
      const valid = authData && authData.authenticated;

      if (!valid) {
        throw new Error("Incorrect username or password");
      }
    } catch (error) {
      setErrorMessage(error.message);
      passwordInputRef.current.focus();
    }
  }

  React.useEffect(() => {
    if (document.activeElement !== usernameInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPassword]);

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
                errorMessage
              )}
              type="text"
              name="username"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
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
                errorMessage
              )}
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
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
              <Trans i18nKey="login">Login</Trans>
            </button>
          </div>
        </form>
      </div>
      <div className="omrs-margin-top-32">
        <p className={styles["powered-by-txt"]}>
          <Trans i18nKey="poweredBy">Powered by</Trans>
        </p>
        <div>
          <svg role="img" className={styles["powered-by-logo"]}>
            <use xlinkHref="#omrs-logo-partial-mono"></use>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Login;
