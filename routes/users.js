const express = require('express');
const router = express.Router();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/auth');

const User = require('../models/User');
const { ACCESS_TOKEN_SECRET } = require('../constants/system');
const {
  MSG_UPDATE_SUCCESS,
  MSG_INTERNAL_SERVER_ERROR,
  MSG_USER_NOT_FOUND_AUTHORISED,
  MSG_USER_UNDEFINED,
  MSG_USER_INFO_MISS,
  MSG_EMAIL_EXIST,
  MSG_EMAIL_NONE,
  MSG_NAME_NONE,
} = require('../constants/message');

// @route GET api/user
// @desc Get all user except UserId
// @access Public
router.post('/', async (req, res) => {
  try {
    const users = await User.find({
      _id: { $nin: [req.body.userId] },
      permission: { $nin: [99] },
    }).select('-password -__v -registered_date');
    res.json({ success: true, users });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route GET api/user
// @desc Get user with id
// @access Public
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id }).select(
      '-password -__v -registered_date'
    );
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
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
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
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
      .json({ success: false, message: MSG_USER_INFO_MISS });

  try {
    // Check for existing user
    const user = await User.findOne({ email });

    if (user)
      return res.status(400).json({ success: false, message: MSG_EMAIL_EXIST });

    // All good
    const hashedPassword = await argon2.hash(password);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Return token
    const accessToken = jwt.sign({ userId: newUser._id }, ACCESS_TOKEN_SECRET);

    // Response
    res.json({
      success: true,
      message: MSG_UPDATE_SUCCESS,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route PUT api/user
// @desc Put Update user
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .json({ success: false, message: MSG_USER_UNDEFINED });
  }

  const { name, email } = req.body;

  // Simple validation
  if (!name)
    return res.status(400).json({ success: false, message: MSG_NAME_NONE });

  if (!email)
    return res.status(400).json({ success: false, message: MSG_EMAIL_NONE });

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

// @route PUT api/user
// @desc Put Set permission user
// @access Private
router.put('/set-permission/:id', verifyToken, async (req, res) => {
  if (!req.params.id) {
    return res
      .status(400)
      .json({ success: false, message: MSG_USER_UNDEFINED });
  }

  const { isAdmin } = req.body;
  const permission = isAdmin ? 1 : 0;

  // Update data
  try {
    let updatedUser = {
      permission,
    };

    const userUpdateCondition = { _id: req.params.id };

    updatedUser = await User.findOneAndUpdate(userUpdateCondition, updatedUser);

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

module.exports = router;
