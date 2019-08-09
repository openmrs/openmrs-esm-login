export function performLogin(username, password) {
  const token = window.btoa(`${username}:${password}`);
  return
    // @ts-ignore
    window.fetch(window.openmrsBase + `/ws/rest/v1/session`, {
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
