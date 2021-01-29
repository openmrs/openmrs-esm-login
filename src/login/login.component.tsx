import React from "react";
import styles from "../styles.css";
import { Button, TextInput, Link } from "carbon-components-react";
import { RouteComponentProps } from "react-router-dom";
import { always } from "kremling";
import { Trans } from "react-i18next";
import { useConfig } from "@openmrs/esm-react-utils";
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
            <TextInput
              id="username"
              className={always("omrs-input-outlined").maybe(
                "omrs-input-danger",
                errorMessage
              )}
              type="text"
              name="username"
              labelText="Username"
              value={username}
              onChange={(evt) => setUsername(evt.target.value)}
              ref={usernameInputRef}
              autoFocus
              required
            />
          </div>
          <div className="omrs-input-group">
            <TextInput.PasswordInput
              id="password"
              invalidText="A valid value is required"
              labelText="Password"
              className={always("omrs-input-outlined").maybe(
                "omrs-input-danger",
                errorMessage
              )}
              name="password"
              value={password}
              onChange={(evt) => setPassword(evt.target.value)}
              ref={passwordInputRef}
              required
            />
          </div>
          <div className={styles["right"]}>
            <Button
              aria-label="Toggle view password text"
              onClick={() => setShowPassword(!showPassword)}
              className={always(
                `omrs-margin-top-24 omrs-btn omrs-btn-lg  ${styles["submit-btn"]}`
              ).toggle(
                "omrs-filled-disabled",
                "omrs-filled-action",
                !password || !username
              )}
              type="submit"
              disabled={!password || !username}
              size="field"
            >
              <Trans i18nKey="login">Login</Trans>
            </Button>
          </div>
          <div className={styles["center"]}>
            <p className={styles["error-msg"]}>{errorMessage}</p>
          </div>
        </form>
      </div>
      <div>
        <p>
          <Trans i18nKey="needHelp" className={styles["need-help-txt"]}>
            Need help ?
          </Trans>
          <Link href="#" className={styles["contact-administrator"]}>
            <Trans i18nKey="contactAdmin">Contact the site administrator</Trans>
          </Link>
        </p>
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
