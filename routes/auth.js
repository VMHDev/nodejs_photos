const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Token = require('../models/Token');
const verifyToken = require('../middleware/auth');
const { generateTokens } = require('../utils/helper');
const { REFRESH_TOKEN_SECRET } = require('../constants/system');

// @route POST api/auth/login
// @desc Post Login user
// @access Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Simple validation
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: 'Missing email and/or password' });

  try {
    // Check for existing user
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect email or password' });

    // Email found
    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid)
      return res
        .status(400)
        .json({ success: false, message: 'Incorrect email or password' });

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
      message: 'User logged in successfully',
      accessToken: tokens.accessToken,
      user: userPublic,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      .json({ success: false, message: 'Refresh token is required' });

  // Check for existing user
  const user = await User.findOne({ refresh_token: refreshToken });

  if (!user)
    return res
      .status(403)
      .json({ success: false, message: 'Refresh token invalid' });

  try {
    // Verify refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Create JWT
    const tokens = generateTokens({ id: user._id, email: user.email });

    // Replace refresh token in database
    let updatedUser = {
      refresh_token: tokens.refreshToken,
    };
    const userUpdateCondition = { _id: user._id };

    updatedUser = await User.findOneAndUpdate(
      userUpdateCondition,
      updatedUser,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Update success!',
      tokens,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route POST api/auth/logout
// @desc Post Logout
// @access Public
router.post('/logout', verifyToken, async (req, res) => {
  // Check for existing user
  const user = await User.findOne({ _id: req.userId });

  if (!user)
    return res.status(403).json({ success: false, message: 'User not found' });

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
      message: 'Update success!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route PUT api/user
// @desc Put Change password
// @access Private
router.put('/password/:id', async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ success: false, message: 'User undefined' });
  }

  const { password } = req.body;

  // Simple validation
  if (!password)
    return res
      .status(400)
      .json({ success: false, message: 'Password is required' });

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
        message: 'User not found or user not authorised',
      });

    res.json({
      success: true,
      message: 'Update user success!',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
    res.status(500).json({ success: false, message: 'Internal server error' });
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
      .json({ success: false, message: 'Missing user_id and/or token' });

  try {
    // All good
    const newToken = new Token({ user_id, token });
    await newToken.save();

    // Response
    res.json({
      success: true,
      message: 'Token created successfully',
      token: newToken.token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
