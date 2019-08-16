import React from "react";
import { css } from "@emotion/core";
import { performLogin } from "./login.resource";

export default function Login(props: LoginProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const usernameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isLoggingIn) {
      performLogin(username, password)
        .then(data => {
          props.history.push("/patient-search");
        })
        .finally(() => {
          setIsLoggingIn(false);
        });
    }
  }, [isLoggingIn]);

  React.useEffect(() => {
    if (document.activeElement !== usernameInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, [showPassword, passwordInputRef.current, usernameInputRef.current]);

  const input = css`
    width: 100%;
    padding: 10px 5px;
    box-sizing: border-box;
    font-size: 14px;
    margin: 10px 0px 10px 0px;
    border-radius: 4px;
  `;

  return (
    <div
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
        background: #fafbfc;
      `}
    >
      <div
        className="omrs-card omrs-padding-16"
        css={css`
          width: 300px;
        `}
      >
        <svg role="img">
          <use xlinkHref="#omrs-logo-full-color" />
        </svg>
        <form
          onSubmit={handleSubmit}
          css={css`
            margin: 10px;
          `}
        >
          <div>
            <label>
              <input
                css={css`
                  ${input}
                `}
                type="text"
                name="username"
                value={username}
                onChange={evt => setUsername(evt.target.value)}
                placeholder="Username"
                ref={usernameInputRef}
                autoFocus
              />
            </label>
          </div>
          <div
            css={css`
              position: relative;
            `}
          >
            <label>
              <input
                css={css`
                  ${input}
                `}
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={evt => setPassword(evt.target.value)}
                placeholder="Password"
                ref={passwordInputRef}
              />
            </label>
            <button
              className="omrs-unstyled"
              type="button"
              aria-label="Toggle view password text"
              onClick={() => setShowPassword(!showPassword)}
              css={css`
                cursor: pointer;
              `}
            >
              <svg
                className="omrs-icon"
                role="img"
                css={css`
                  top: calc(50% - 0.75rem);
                  right: 0.75rem;
                  position: absolute;
                `}
              >
                <use xlinkHref="#omrs-icon-visibility" />
              </svg>
            </button>
          </div>
          <div>
            <button
              className="omrs-btn omrs-filled-action"
              css={css`
                width: 100%;
              `}
              type="submit"
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
