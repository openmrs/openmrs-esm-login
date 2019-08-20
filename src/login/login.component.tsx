import React from "react";
import { css } from "@emotion/core";
import { performLogin } from "./login.resource";
import { always, maybe } from "kremling";

export default function Login(props: LoginProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [authenticated, setAuthenticated] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const usernameInputRef = React.useRef<HTMLInputElement>(null);
  const formRef = React.useRef<HTMLFormElement>(null);

  React.useEffect(() => {
    if (isLoggingIn) {
      performLogin(username, password)
        .then(data => {
          // workaround for now, @openmrs/esm-api response.json() not working!
          const authData = data["data"];
          if (authData) {
            const { authenticated } = authData;
            if (authenticated) {
              props.history.push("/patient-search");
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
    if (document.activeElement !== usernameInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPassword, passwordInputRef.current, usernameInputRef.current]);

  return (
    <div
      className="canvas"
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
      `}
    >
      <div className="omrs-card omrs-padding-16">
        <div
          css={css`
            text-align: center;
          `}
        >
          <svg role="img">
            <use xlinkHref="#omrs-logo-full-color"></use>
          </svg>
        </div>
        <form
          onSubmit={handleSubmit}
          className="omrs-margin-top-32"
          ref={formRef}
        >
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
              className="omrs-unstyled"
              type="button"
              aria-label="Toggle view password text"
              onClick={() => setShowPassword(!showPassword)}
              css={css`
                cursor: pointer;
              `}
            >
              <svg className="omrs-icon" role="img">
                <use xlinkHref="#omrs-icon-visibility" />
              </svg>
            </button>
          </div>
          <div
            css={css`
              text-align: center;
            `}
          >
            <p
              css={css`
                color: var(--omrs-color-danger);
              `}
            >
              {errorMessage}
            </p>
          </div>
          <div>
            <button
              className={always(
                "omrs-margin-top-24 omrs-btn omrs-btn-lg"
              ).toggle(
                "omrs-filled-disabled",
                "omrs-filled-action",
                !password || !username
              )}
              type="submit"
              css={css`
                width: 100%;
              `}
              disabled={!password || !username}
            >
              Login
            </button>
          </div>
        </form>
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
