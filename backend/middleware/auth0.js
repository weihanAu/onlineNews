const { auth } = require('express-oauth2-jwt-bearer');

module.exports= auth({
  audience: 'verysafe',
  issuerBaseURL: 'https://dev-8isqtq4d4y417z1b.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});