const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const Category = require('../models/Category');

// @route GET api/category
// @desc Get all category
// @access Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, categories });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route POST api/category
// @desc Create category
// @access Private
router.post('/', verifyToken, async (req, res) => {
  const { name } = req.body;

  // Validation
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: 'Name is required' });

  try {
    const newCategory = new Category({
      name,
    });

    await newCategory.save();

    res.json({
      success: true,
      message: 'Add category success!',
      category: newCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route PUT api/category
// @desc Update category
// @access Private
router.put('/:id', verifyToken, async (req, res) => {
  const { name } = req.body;

  // Simple validation
  if (!name)
    return res
      .status(400)
      .json({ success: false, message: 'Name is required' });

  try {
    let updatedCategory = {
      name,
    };

    const categoryUpdateCondition = { _id: req.params.id };

    updatedCategory = await Category.findOneAndUpdate(
      categoryUpdateCondition,
      updatedCategory,
      { new: true }
    );

    // User not authorised to update category or category not found
    if (!updatedCategory)
      return res.status(401).json({
        success: false,
        message: 'Category not found or user not authorised',
      });

    res.json({
      success: true,
      message: 'Update category success!',
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route DELETE api/category
// @desc Delete category
// @access Private
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const categoryDeleteCondition = { _id: req.params.id };
    const deletedCategory = await Category.findOneAndDelete(
      categoryDeleteCondition
    );

    // User not authorised or category not found
    if (!deletedCategory)
      return res.status(401).json({
        success: false,
        message: 'Category not found or user not authorised',
      });

    res.json({ success: true, category: deletedCategory });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
