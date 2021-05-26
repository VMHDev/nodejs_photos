const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Token = require('../models/Token');

// @route POST api/auth/login
// @desc Login user
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

    // All good
    // Return token
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    res.json({
      success: true,
      message: 'User logged in successfully',
      accessToken,
      user,
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
