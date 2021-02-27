const jwt = require("jsonwebtoken");


const SECRET = require("../keys").SECRET;

function auth (req, res, next) {
  
  const token = req.header('x-auth-token');

  // Check for token
  if (!token)
    return res.status(401).json({ msg: 'token is not present, authorization denied' });

  try {
    // Verify token
    const decoded = jwt.verify(token, SECRET);
    // Add user from payload
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: 'Token is not valid' });
  }
};

module.exports = auth;