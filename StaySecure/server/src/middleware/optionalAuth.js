const jwt = require('jsonwebtoken');

const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = optionalAuth;
