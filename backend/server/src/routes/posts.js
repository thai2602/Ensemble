import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import slugify from 'slugify';
import path from 'path';
import { fileURLToPath } from 'url';

import Post from '../models/posts.js';
import { isAuth } from '../middlewares/auth.js'
import Shop from '../models/shop.js';
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

// POST /posts
router.post('/', isAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, summary, content, categories } = req.body;
    const imageUrl = req.file ? getFileUrl(`uploads/${req.file.filename}`) : '';

    let categoryArray = [];
    if (categories) {
      categoryArray = (Array.isArray(categories) ? categories : JSON.parse(categories))
        .map(id => new mongoose.Types.ObjectId(id));
    }

    const newPost = await Post.create({
      userId: req.user._id,
      title,
      summary,
      content,
      image: imageUrl,
      categories: categoryArray,
      slug: slugify(title, { lower: true, strict: true }),
    });

    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error while creating post' });
  }
});

// GET /posts
router.get('/', async (req, res) => {
  try {
    const { category, shop } = req.query;
    const filter = {};
    if (category) filter.categories = category;
    if (shop && mongoose.isValidObjectId(shop)) filter.shop = shop;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate("userId", "username email")
      .populate({
        path: 'categories',
        select: 'name slug',
      })
      .populate({ path: 'shop', select: 'name slug avatar' });

    res.json(posts);
  } catch (error) {
    console.error('Error while fetching post list:', error);
    res.status(500).json({ message: 'Error while fetching post list' });
  }
});

// GET /posts/me
router.get('/me', isAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip = (page - 1) * limit;

    const { category, search } = req.query;
    const filter = { userId };

    if (category) {
      filter.categories = category;
    }

    if (search) {
      const rx = new RegExp(search.trim(), 'i');
      filter.$or = [{ title: rx }, { summary: rx }];
    }

    const [items, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'username email')
        .populate({ path: 'categories', select: 'name slug' })
        .populate({ path: 'shop', select: 'name slug avatar' }),
      Post.countDocuments(filter),
    ]);

    res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    console.error('Error while fetching my posts:', error);
    res.status(500).json({ message: 'Error while fetching your posts' });
  }
});

// GET /posts/:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug })
      .populate("userId", "username email")
      .populate({
        path: 'categories',
        select: 'name slug'
      })
      .populate({ path: 'shop', select: 'name slug avatar' });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Error while fetching post by slug:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /posts/:id
router.patch('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { shop } = req.body;

    const update = { ...req.body };

    if (shop !== undefined) {
      if (shop === null || shop === '') {
        update.shop = null;
      } else {
        if (!mongoose.isValidObjectId(shop)) {
          return res.status(400).json({ message: 'Invalid shop id' });
        }
        const exists = await Shop.findById(shop).select('_id');
        if (!exists) return res.status(404).json({ message: 'Shop not found' });
        update.shop = shop;
      }
    }

    const post = await Post.findByIdAndUpdate(id, update, { new: true })
      .populate('userId', 'username email')
      .populate({ path: 'categories', select: 'name slug' })
      .populate({ path: 'shop', select: 'name slug avatar' });

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    console.error('Error while updating post:', error);
    res.status(500).json({ message: 'Error while updating post' });
  }
});

// DELETE /posts/:id
router.delete('/:id', isAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user is the owner
    if (String(post.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'You can only delete your own posts' });
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error while deleting post:', error);
    res.status(500).json({ message: 'Error while deleting post' });
  }
});

export default router;
