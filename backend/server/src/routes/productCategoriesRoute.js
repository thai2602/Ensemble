import express from 'express';
import ProductCategory from '../models/ProductCategories.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const productCategories = await ProductCategory.find();
  res.json(productCategories);
});

router.post('/', async (req, res) => {
  try {
    const productcat = new ProductCategory(req.body);
    await productcat.save();
    res.status(201).json(productcat);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;