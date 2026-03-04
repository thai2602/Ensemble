import express from 'express';
import Category from '../models/postCategories.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

router.post('/', async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;