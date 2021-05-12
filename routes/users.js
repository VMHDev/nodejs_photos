const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// @route POST api/auth/register
// @desc Register user
// @access Public
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password)
    return res
      .status(400)
      .json({ success: false, message: 'Missing email and/or password' });

  try {
    // Check for existing user
    const user = await User.findOne({ email });

    if (user)
      return res
        .status(400)
        .json({ success: false, message: 'Email already token' });

    // All good
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Return token
    const accessToken = jwt.sign(
      { userId: newUser._id },
      process.env.ACCESS_TOKEN_SECRET
    );

    // Response
    res.json({
      success: true,
      message: 'User created successfully',
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
