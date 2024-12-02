import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

import './index.css';
import App from './App';

ReactDOM.render(
  <BrowserRouter>
  <Auth0Provider
    domain="dev-8isqtq4d4y417z1b.us.auth0.com"
    clientId="y803EC0ows63rQnJ899VZZg74SbB1kF1"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: "verysafe",
      scope: "openid profile email"
    }}
  >
    <App/>
  </Auth0Provider>    
  </BrowserRouter>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
