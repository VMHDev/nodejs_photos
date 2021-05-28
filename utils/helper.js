const jwt = require('jsonwebtoken');

const generateTokens = (payload) => {
  const { id, email } = payload;

  // Create JWT
  const accessToken = jwt.sign(
    { userId: id, userEmail: email },
    process.env.ACCESS_TOKEN_SECRET,
    {
      algorithm: 'HS512',
      expiresIn: '60s',
    }
  );

  const refreshToken = jwt.sign(
    { userId: id, userEmail: email },
    process.env.REFRESH_TOKEN_SECRET,
    {
      algorithm: 'HS384',
      expiresIn: '1h',
    }
  );

  return { accessToken, refreshToken };
};

module.exports = {
  generateTokens,
};
