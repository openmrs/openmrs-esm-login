import React from "react";
import styles from "../styles.scss";
import ArrowRight24 from "@carbon/icons-react/es/arrow--right/24";
import Button from "carbon-components-react/es/components/Button";
import TextInput from "carbon-components-react/es/components/TextInput";
import { RouteComponentProps } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { useConfig } from "@openmrs/esm-framework";
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
  const [t] = useTranslation();

  React.useEffect(() => {
    if (user) {
      props.history.push(
        "/login/location",
        props.location ? props.location.state : undefined
      );
    }
  }, [user, props.history, props.location]);

  React.useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  React.useEffect(() => {
    if (document.activeElement !== usernameInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPassword]);

  function continueLogin() {
    if (usernameInputRef.current.value.length > 0) {
      setShowPassword(true);
    } else {
      usernameInputRef.current.focus();
    }
  }

  async function handleSubmit(evt: React.FormEvent<HTMLFormElement>) {
    evt.preventDefault();

    if (!showPassword) {
      continueLogin();
      return;
    }

    try {
      const loginRes = await performLogin(username, password);
      const authData = loginRes.data;
      const valid = authData && authData.authenticated;

      if (!valid) {
        throw new Error("Incorrect username or password");
      }
    } catch (error) {
      setErrorMessage(error.message);
      setShowPassword(false);
      resetUserNameAndPassword();
    }
  }

  const resetUserNameAndPassword = () => {
    usernameInputRef.current.focus();
    setUsername("");
    setPassword("");
  };

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
          {!showPassword && (
            <div className={styles["input-group"]}>
              <TextInput
                id="username"
                type="text"
                name="username"
                labelText={t("username", "UserName")}
                className={styles.inputStyle}
                value={username}
                onChange={(evt) => setUsername(evt.target.value)}
                ref={usernameInputRef}
                autoFocus
                required
              />

              <input
                id="password-hidden"
                style={{ height: 0, width: 0, border: 0 }}
                type="password"
                name="password-hidden"
              />

              <Button
                className={styles.continueButton}
                renderIcon={ArrowRight24}
                iconDescription="Next"
                onClick={continueLogin}
              >
                {t("continue", "Continue")}
              </Button>
            </div>
          )}
          {showPassword && (
            <div className={styles["input-group"]}>
              <input
                id="username-hidden"
                type="text"
                name="username-hidden"
                style={{ height: 0, width: 0, border: 0 }}
                value={username}
                required
              />

              <TextInput.PasswordInput
                id="password"
                invalidText={t("A valid value is required")}
                labelText={t("password")}
                name="password"
                className={styles.inputStyle}
                value={password}
                onChange={(evt) => setPassword(evt.target.value)}
                ref={passwordInputRef}
                required
                showPasswordLabel="Show password"
              />

              <Button
                aria-label="submit"
                type="submit"
                className={styles.continueButton}
                renderIcon={ArrowRight24}
                iconDescription="Next"
              >
                <Trans i18nKey="login">Log in</Trans>
              </Button>
            </div>
          )}
          <div className={styles["center"]}>
            <p className={styles["error-msg"]}>
              {t("errorMessage", errorMessage)}
            </p>
          </div>
        </form>
      </div>
      <div className={styles["need-help"]}>
        <p className={styles["need-help-txt"]}>
          <Trans i18nKey="needHelp">Need help?</Trans>
          <Button kind="ghost">
            {t("contactAdmin", "Contact the site administrator")}
          </Button>
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
