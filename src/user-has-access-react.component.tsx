import React from "react";
import { getCurrentUser } from "@openmrs/esm-api";

export default function UserHasAccessReact(props) {
  const [user, setUser] = React.useState(null);

  function hasAccess(requiredPrivilege) {
    //@ts-ignore
    return user.privileges.find(p => requiredPrivilege === p.display);
  }

  React.useEffect(() => {
    const subscription = getCurrentUser({ includeAuthStatus: false }).subscribe(
      x => {
        setUser(x);
      }
    );
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  try {
    if (user && hasAccess(props.privilege)) {
      return props.children;
    }
  } catch (e) {}

  return null;
}
