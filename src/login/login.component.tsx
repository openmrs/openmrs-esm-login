import React from "react";
import { css } from "@emotion/core";
import { performLogin } from "./login.resource";

export default function Login(props: LoginProps) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

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

  //TODO replace this with ESM
  const implementationConfig = {
    logoUrl:
      "https://implementation-assets.sfo2.digitaloceanspaces.com/openmrs_logo_white_large.png"
  };

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
        <div
          css={css`
            margin: 20px;
          `}
        >
          <img
            src={getLogoURL()}
            alt="openmrs-logo"
            css={css`
              max-width: 85%;
              max-height: 100%;
              display: block;
              margin: auto;
            `}
          />
        </div>
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
                autoFocus
              />
            </label>
          </div>
          <div>
            <label>
              <input
                css={css`
                  ${input}
                `}
                type="password"
                name="password"
                value={password}
                onChange={evt => setPassword(evt.target.value)}
                placeholder="Password"
              />
            </label>
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

  function getLogoURL() {
    return implementationConfig["logoUrl"];
  }
}

type LoginProps = {
  history?: {
    push(newUrl: String): void;
  };
};
