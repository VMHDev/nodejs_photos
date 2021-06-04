const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Photo = require('../models/Photo');
const {
  MSG_UPDATE_SUCCESS,
  MSG_CREATE_SUCCESS,
  MSG_INTERNAL_SERVER_ERROR,
  MSG_PHOTO_NONE,
  MSG_PHOTO_CATEGORY_NONE,
  MSG_PHOTO_TITLE_NONE,
  MSG_PHOTO_NOT_FOUND_AUTHORISED,
} = require('../constants/message');

// @route GET api/photo
// @desc Get all photo
// @access Public
router.get('/', verifyToken, async (req, res) => {
  try {
    const photos = await Photo.find({})
      .populate('user', ['email'])
      .populate('category', ['_id', 'name'])
      .select('-__v -registered_date');
    res.json({ success: true, photos });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route GET api/photo
// @desc Get photo public
// @access Private
router.get('/public', async (req, res) => {
  try {
    const photos = await Photo.find({ is_public: true })
      .populate('user', ['email'])
      .populate('category', ['_id', 'name'])
      .select('-__v -registered_date');
    res.json({ success: true, photos });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route GET api/photo
// @desc Get photo with user id
// @access Private
router.get('/user', verifyToken, async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.userId })
      .populate('user', ['email'])
      .populate('category', ['_id', 'name'])
      .select('-__v -registered_date');
    res.json({ success: true, photos });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route POST api/photo
// @desc Create photo
// @access Private
router.post('/', verifyToken, async (req, res) => {
  const { categoryId, path, title, desc, userId, is_public } = req.body;

  // Validation
  if (!path)
    return res.status(400).json({ success: false, message: MSG_PHOTO_NONE });
  if (!categoryId)
    return res
      .status(400)
      .json({ success: false, message: MSG_PHOTO_CATEGORY_NONE });
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: MSG_PHOTO_TITLE_NONE });

  try {
    const newPhoto = new Photo({
      category: categoryId,
      path,
      title,
      desc,
      user: userId,
      is_public,
    });

    // Save database
    await newPhoto.save();

    // Remove info unnecessary
    let resPhoto = (({ _id, path, title, desc }) => ({
      _id,
      path,
      title,
      desc,
      is_public,
    }))(newPhoto);

    res.json({
      success: true,
      message: MSG_CREATE_SUCCESS,
      photo: resPhoto,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route PUT api/photo
// @desc Update photo
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
  const { category, path, title, desc, is_public } = req.body;

  // Validation
  if (!path)
    return res.status(400).json({ success: false, message: MSG_PHOTO_NONE });
  if (!category)
    return res
      .status(400)
      .json({ success: false, message: MSG_PHOTO_CATEGORY_NONE });
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: MSG_PHOTO_TITLE_NONE });

  try {
    let updatedPhoto = {
      category,
      path,
      title,
      desc,
      is_public,
    };

    const photoUpdateCondition = { _id: req.params.id };

    // Save database
    updatedPhoto = await Photo.findOneAndUpdate(
      photoUpdateCondition,
      updatedPhoto,
      { new: true }
    );

    // Remove info unnecessary
    let resPhoto = (({ _id, path, title, desc }) => ({
      _id,
      path,
      title,
      desc,
      is_public,
    }))(updatedPhoto);

    // User not authorised to update photo or photo not found
    if (!updatedPhoto)
      return res.status(401).json({
        success: false,
        message: MSG_PHOTO_NOT_FOUND_AUTHORISED,
      });

    res.json({
      success: true,
      message: MSG_UPDATE_SUCCESS,
      photo: resPhoto,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

// @route DELETE api/photo
// @desc Delete photo
// @access Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const photoDeleteCondition = { _id: req.params.id };
    const deletedPhoto = await Photo.findOneAndDelete(photoDeleteCondition);

    // User not authorised or photo not found
    if (!deletedPhoto)
      return res.status(401).json({
        success: false,
        message: MSG_PHOTO_NOT_FOUND_AUTHORISED,
      });

    res.json({ success: true, photo: deletedPhoto });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: MSG_INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;
