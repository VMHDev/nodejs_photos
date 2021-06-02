const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

const User = require('../models/User');
const { ACCESS_TOKEN_SECRET } = require('../constants/system');

// @route GET api/user
// @desc Get user with email
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select(
      '-password -__v -registered_date'
    );
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route GET api/user/email
// @desc Post user with email
// @access Public
router.post('/email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select(
      '-password -__v -registered_date'
    );
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route POST api/user/register
// @desc Post Register user
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
    const accessToken = jwt.sign({ userId: newUser._id }, ACCESS_TOKEN_SECRET);

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

// @route PUT api/user
// @desc Put Update user
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ success: false, message: 'User undefined' });
  }

  const { name, email } = req.body;

  // Simple validation
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: 'Name is required' });

  if (!email)
    return res
      .status(400)
      .json({ success: false, message: 'Email is required' });

  // Update data
  try {
    let updatedUser = {
      name,
      email,
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

module.exports = router;
