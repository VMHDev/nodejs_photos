const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Photo = require('../models/Photo');

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
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route GET api/photo
// @desc Get photo public
// @access Private
router.get('/public', async (req, res) => {
  try {
    const photos = await Photo.find({ isPublic: true })
      .populate('user', ['email'])
      .populate('category', ['_id', 'name'])
      .select('-__v -registered_date');
    res.json({ success: true, photos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route GET api/photo
// @desc Get photo with user id
// @access Private
router.post('/user', verifyToken, async (req, res) => {
  try {
    const photos = await Photo.find({ user: req.userId })
      .populate('user', ['email'])
      .populate('category', ['_id', 'name'])
      .select('-__v -registered_date');
    res.json({ success: true, photos });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route POST api/photo
// @desc Create photo
// @access Private
router.post('/', verifyToken, async (req, res) => {
  const { categoryId, path, title, desc, userId, isPublic } = req.body;

  // Validation
  if (!path)
    return res
      .status(400)
      .json({ success: false, message: 'Photo is required' });
  if (!categoryId)
    return res
      .status(400)
      .json({ success: false, message: 'Category is required' });
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: 'Title is required' });

  try {
    const newPhoto = new Photo({
      category: categoryId,
      path,
      title,
      desc,
      user: userId,
      isPublic,
    });

    // Save database
    await newPhoto.save();

    // Remove info unnecessary
    let resPhoto = (({ _id, path, title, desc }) => ({
      _id,
      path,
      title,
      desc,
      isPublic,
    }))(newPhoto);

    res.json({
      success: true,
      message: 'Add photo success!',
      photo: resPhoto,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route PUT api/photo
// @desc Update photo
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
  const { category, path, title, desc, isPublic } = req.body;

  // Validation
  if (!path)
    return res
      .status(400)
      .json({ success: false, message: 'Photo is required' });
  if (!category)
    return res
      .status(400)
      .json({ success: false, message: 'Category is required' });
  if (!title)
    return res
      .status(400)
      .json({ success: false, message: 'Title is required' });

  try {
    let updatedPhoto = {
      category,
      path,
      title,
      desc,
      isPublic,
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
      isPublic,
    }))(updatedPhoto);

    // User not authorised to update photo or photo not found
    if (!updatedPhoto)
      return res.status(401).json({
        success: false,
        message: 'Photo not found or user not authorised',
      });

    res.json({
      success: true,
      message: 'Update photo success!',
      photo: resPhoto,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
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
        message: 'Photo not found or user not authorised',
      });

    res.json({ success: true, photo: deletedPhoto });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
