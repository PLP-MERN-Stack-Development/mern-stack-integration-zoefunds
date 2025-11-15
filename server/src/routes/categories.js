const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

router.post(
  '/',
  [body('name').isLength({ min: 1 }).withMessage('Name is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    try {
      const { name, description } = req.body;
      const existing = await Category.findOne({ name });
      if (existing) return res.status(409).json({ message: 'Category exists' });
      const cat = new Category({ name, description });
      await cat.save();
      res.status(201).json(cat);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;