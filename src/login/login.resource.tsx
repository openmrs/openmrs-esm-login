export function performLogin(username, password) {
  const token = window.btoa(`${username}:${password}`);
  return window
    .fetch(window.getOpenmrsSpaBase +`/openmrs/ws/rest/v1/session`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Basic ${token}`
      }
    })
    .then(resp => {
      if (resp.ok) {
        return resp.json();
      } else {
        throw Error(
          `Could not login. Server responded with status ${resp.status}`
        );
      }
    });
}
