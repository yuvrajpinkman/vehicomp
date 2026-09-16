const jwt = require('jsonwebtoken');

const getJwtSecret = () => process.env.JWT_SECRET || 'dev_jwt_secret_key_12345';
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || '7d';

const signToken = (payload) => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: getJwtExpiresIn(),
  });
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

module.exports = {
  signToken,
  verifyToken,
  getJwtSecret,
  getJwtExpiresIn,
};
