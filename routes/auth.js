const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const verifyToken = require('../middleware/auth');
const User = require('../models/User');

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

module.exports = router;
