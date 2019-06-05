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
          alert("We got the user! " + JSON.stringify(data));
        })
        .finally(() => {
          setIsLoggingIn(false);
        });
    }
  }, [isLoggingIn]);

  return (
    <div
      css={css`
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100vw;
        height: 100vh;
      `}
    >
      <div
        css={css`
          padding: 16px;
          border: 1px solid gray;
          border-radius: 3px;
        `}
      >
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              <span>Username</span>
              <input
                type="text"
                name="username"
                value={username}
                onChange={evt => setUsername(evt.target.value)}
                autoFocus
              />
            </label>
          </div>
          <div>
            <label>
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={password}
                onChange={evt => setPassword(evt.target.value)}
              />
            </label>
          </div>
          <div>
            <button type="submit">Login</button>
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

type LoginProps = {};
