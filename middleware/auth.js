const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../constants/system');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: 'Access token not found' });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // Trả về dữ liệu trong access token
    req.accessTokenPayload = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(403).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = verifyToken;
