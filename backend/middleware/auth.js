const jwt = require('jsonwebtoken');



module.exports = (req, res, next) => {
  // is loggin by google sso?
  // custom login
  const authHeader = req.get('Authorization');
  if (!authHeader) {
   req.isAuth=false;
    return next();
  }
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, 'veryveryverysecret');
  } catch (err) {
    req.isAuth=false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth=false;
    next();
  }
  req.userId = decodedToken.userId;
  req.isAuth=true;
   return next();
};
