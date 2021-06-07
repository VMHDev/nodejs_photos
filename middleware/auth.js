const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET } = require('../constants/system');
const {
  MSG_ACCESS_TOKEN_NONE,
  MSG_ACCESS_TOKEN_INVALID,
} = require('../constants/message');

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res
      .status(401)
      .json({ success: false, message: MSG_ACCESS_TOKEN_NONE });

  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);

    // Trả về dữ liệu trong access token
    req.accessTokenPayload = decoded;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ success: false, message: MSG_ACCESS_TOKEN_INVALID });
  }
};

module.exports = verifyToken;
