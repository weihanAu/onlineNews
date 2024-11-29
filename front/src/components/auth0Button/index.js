import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Button from '../Button/Button'

const LoginButton = (props) => {
  const { loginWithRedirect } = useAuth0();

  const clickhandler =()=>{
    loginWithRedirect();
  }

  return <Button design="raised" onClick={clickhandler}>LOGIN</Button>;
};

export default LoginButton;