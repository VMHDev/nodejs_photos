const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Token = require('../models/Token');
const verifyToken = require('../middleware/auth');
const { generateTokens } = require('../utils/helper');
const { REFRESH_TOKEN_SECRET } = require('../constants/system');
const {
  MSG_UPDATE_SUCCESS,
  MSG_CREATE_SUCCESS,
  MSG_INTERNAL_SERVER_ERROR,
  MSG_USER_NOT_FOUND,
  MSG_USER_NOT_FOUND_AUTHORISED,
  MSG_USER_UNDEFINED,
  MSG_USER_LOGIN_SUCCESS,
  MSG_LOGIN_INFO_MISS,
  MSG_LOGIN_INFO_INCORRECT,
  MSG_REFRESH_TOKEN_NONE,
  MSG_REFRESH_TOKEN_INVALID,
  MSG_REFRESH_TOKEN_EXPIRE,
  MSG_PASSWORD_NONE,
  MSG_PASSWORD_INFO_MISS,
} = require('../constants/message');

// @route POST api/auth/login
// @desc Post Login user
// @access Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: MSG_LOGIN_INFO_MISS });

  try {
    // Check for existing user
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: MSG_LOGIN_INFO_INCORRECT });

    // Email found
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: MSG_LOGIN_INFO_INCORRECT });

    // Create JWT
    const tokens = generateTokens({ id: user._id, email: user.email });

    // Update refresh token in database
    let updatedUser = {
      refresh_token: tokens.refreshToken,
    };
    const userUpdateCondition = { _id: user._id };

    updatedUser = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedUser,
      { new: true }
    );

    // Remove info unnecessary
    // Ref: https://medium.com/data-scraper-tips-tricks/create-an-object-from-another-in-one-line-es6-96125ec6c834
    let userPublic = (({ _id, name, email, refresh_token }) => ({
      _id,
      name,
      email,
      refresh_token,
    }))(updatedUser);

    res.json({
      success: true,
      message: MSG_USER_LOGIN_SUCCESS,
      accessToken: tokens.accessToken,
      user: userPublic,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route POST api/auth/token-refresh
// @desc Post Refresh token
// @access Public
router.post('/token-refresh', async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken)
    return res
      .status(401)
      .json({ success: false, message: MSG_REFRESH_TOKEN_NONE });

  // Check for existing user
  const user = await User.findOne({ refresh_token: refreshToken });

  if (!user)
    return res
      .status(403)
      .json({ success: false, message: MSG_REFRESH_TOKEN_INVALID });

  // Verify refresh token
  try {
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: MSG_REFRESH_TOKEN_EXPIRE,
      isExpire: true,
    });
  }

  // Create new token
  try {
    // Create JWT
    const token = generateTokens({ id: user._id, email: user.email });

    // Replace refresh token in database
    let updatedUser = {
      refresh_token: token.refreshToken,
    };
    const userUpdateCondition = { _id: user._id };

    updatedUser = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedUser,
      { new: true }
    );

    res.json({
      success: true,
      message: MSG_UPDATE_SUCCESS,
      token,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route POST api/auth/logout
// @desc Post Logout
// @access Public
router.post('/logout', async (req, res) => {
  // Check for existing user
  const user = await User.findOne({ _id: req.body.userId });

  if (!user)
    return res
      .status(401)
      .json({ success: false, message: MSG_USER_NOT_FOUND });

  try {
    // Remove refresh token in database
    let updatedUser = {
      refresh_token: null,
    };
    const userUpdateCondition = { _id: user._id };

    updatedUser = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedUser,
      { new: true }
    );

    res.json({
      success: true,
      message: MSG_UPDATE_SUCCESS,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route PUT api/user
// @desc Put Change password
// @access Private
router.put('/password/:id', async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .json({ success: false, message: MSG_USER_UNDEFINED });
  }

  const { password } = req.body;

  // Simple validation
  if (!password)
    return res.status(400).json({ success: false, message: MSG_PASSWORD_NONE });

  // Update data
  try {
    const hashedPassword = await argon2.hash(password);
    let updatedUser = {
      password: hashedPassword,
    };

    const userUpdateCondition = { _id: req.params.id };

    updatedUser = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedUser,
      { new: true }
    );

    // User not authorised to update user or user not found
    if (!updatedUser)
      return res.status(401).json({
        success: false,
        message: MSG_USER_NOT_FOUND_AUTHORISED,
      });

    res.json({
      success: true,
      message: MSG_UPDATE_SUCCESS,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route GET api/auth/token
// @desc Get token
// @access Public
router.get('/token-password/:token', async (req, res) => {
  try {
    const token_info = await Token.findOne({ token: req.params.token }).select(
      '-__v -_id'
    );
    res.json({ success: true, token_info });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route POST api/auth/token
// @desc Post Add token
// @access Public
router.post('/token-password', async (req, res) => {
  const { user_id, token } = req.body;

  // Validation
  if (!token || !user_id)
    return res
      .status(400)
      .json({ success: false, message: MSG_PASSWORD_INFO_MISS });

  try {
    // All good
    const newToken = new Token({ user_id, token });
    await newToken.save();

    // Response
    res.json({
      success: true,
      message: MSG_CREATE_SUCCESS,
      token: newToken.token,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;
