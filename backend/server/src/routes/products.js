// routes/products.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import slugify from 'slugify';
import mongoose from 'mongoose';
import Product from '../models/products.js';
import ensureShopOwner from '../utils/ensureShopOwner.js';
import { isAuth } from '../middlewares/auth.js';
import { getFileUrl } from '../utils/fileHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

/**
 * POST /products/shop/:shopId
 */
router.post('/shop/:shopId', isAuth, upload.single('image'), async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: 'Invalid shopId' });
    }

    await ensureShopOwner(shopId, req.user._id);

    const {
      name,
      description,
      details,
      price,
      quantity,
      category,
      isFeatured,
    } = req.body;

    const imageUrl = req.file ? getFileUrl(`uploads/${req.file.filename}`) : '';

    const newProduct = new Product({
      shopId,
      name,
      description,
      details,
      price: Number(price),
      quantity: Number(quantity),
      category,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      image: imageUrl,
      slug: slugify(name, { lower: true, strict: true }),
    });

    await newProduct.save();
    const populatedProduct = await newProduct.populate('category', 'name slug');

    res.status(201).json(populatedProduct);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Product (slug) already exists in this shop' });
    }
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(error?.message)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.error('Error while creating product:', error);
    res.status(500).json({ message: 'Error while creating product' });
  }
});

/**
 * GET /products/shop/:shopId
 */
router.get('/shop/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: 'Invalid shopId' });
    }
    const products = await Product.find({ shopId })
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error while fetching products by shop:', error);
    res.status(500).json({ message: 'Error while fetching products by shop' });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      shopId,
      name,
      description,
      details,
      price,
      quantity,
      category,
      isFeatured
    } = req.body;

    if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: 'shopId is required or invalid' });
    }

    // To protect this endpoint, uncomment:
    // await ensureShopOwner(shopId, req.user._id);

    const imageUrl = req.file ? getFileUrl(`uploads/${req.file.filename}`) : '';

    const newProduct = new Product({
      shopId,
      name,
      description,
      details,
      price: Number(price),
      quantity: Number(quantity),
      category,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      image: imageUrl,
      slug: slugify(name, { lower: true, strict: true }),
    });

    await newProduct.save();
    const populatedProduct = await newProduct.populate('category', 'name slug');
    res.status(201).json(populatedProduct);
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Product (slug) already exists in this shop' });
    }
    console.error('Error while creating product:', error);
    res.status(500).json({ message: 'Error while creating product' });
  }
});

router.get('/', async (req, res) => {
  try {
    const { shopId } = req.query;
    const filter = {};
    if (shopId) {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({ message: 'Invalid shopId' });
      }
      filter.shopId = shopId;
    }
    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error while fetching products:', error);
    res.status(500).json({ message: 'Error while fetching products' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await Product.findOne({ slug })
      .populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error while fetching product by slug:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /products/:id
router.patch('/:id', isAuth, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check shop ownership
    await ensureShopOwner(product.shopId, req.user._id);

    const update = {};
    const { name, description, details, price, quantity, category, isFeatured } = req.body;

    if (name !== undefined) update.name = name;
    if (description !== undefined) update.description = description;
    if (details !== undefined) update.details = details;
    if (price !== undefined) update.price = Number(price);
    if (quantity !== undefined) update.quantity = Number(quantity);
    if (category !== undefined) update.category = category;
    if (isFeatured !== undefined) update.isFeatured = isFeatured === 'true' || isFeatured === true;
    
    if (req.file) {
      update.image = getFileUrl(`uploads/${req.file.filename}`);
    }

    if (name) {
      update.slug = slugify(name, { lower: true, strict: true });
    }

    const updated = await Product.findByIdAndUpdate(id, update, { new: true })
      .populate('category', 'name slug');

    res.json(updated);
  } catch (error) {
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(error?.message)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.error('Error while updating product:', error);
    res.status(500).json({ message: 'Error while updating product' });
  }
});

// DELETE /products/:id
router.delete('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    // Check shop ownership
    await ensureShopOwner(product.shopId, req.user._id);

    await Product.findByIdAndDelete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(error?.message)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    console.error('Error while deleting product:', error);
    res.status(500).json({ message: 'Error while deleting product' });
  }
});

export default router;
