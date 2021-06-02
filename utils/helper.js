const jwt = require('jsonwebtoken');
const {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRES,
  REFRESH_TOKEN_EXPIRES,
} = require('../constants/system');

const generateTokens = (payload) => {
  const { id, email } = payload;

  // Create JWT
  const accessToken = jwt.sign(
    { userId: id, userEmail: email },
    ACCESS_TOKEN_SECRET,
    {
      algorithm: 'HS512',
      expiresIn: ACCESS_TOKEN_EXPIRES,
    }
  );

  const refreshToken = jwt.sign(
    { userId: id, userEmail: email },
    REFRESH_TOKEN_SECRET,
    {
      algorithm: 'HS384',
      expiresIn: REFRESH_TOKEN_EXPIRES,
    }
  );

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
};
