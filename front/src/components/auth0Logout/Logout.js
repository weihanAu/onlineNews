import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from '../Button/Button'

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}>
      LOGOUT
    </Button>
  );
};

export default LogoutButton;