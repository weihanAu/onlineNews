import './App.css';
import { Auth0Provider } from '@auth0/auth0-react';
import Login from './component/auth0Button/index.js'
import Logout from './component/auth0Logout/Logout.js'

function App() {
  return (
     <Auth0Provider
      domain="dev-8isqtq4d4y417z1b.us.auth0.com"
      clientId="y803EC0ows63rQnJ899VZZg74SbB1kF1"
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: "verysafe",
        scope: "openid profile email"
      }}

     >
      <div className="App">
        SSO LOGIN DEMO, SITE 2.
        <Login />
        <Logout />
      </div>
    </Auth0Provider>

  );
}

export default App;
