import express from 'express';
import bcrypt from 'bcryptjs';              
import jwt from 'jsonwebtoken';   
import mongoose from "mongoose";

import User from '../models/Users.js';
import Post from '../models/posts.js';
import { isAuth } from '../middlewares/auth.js';   

const router = express.Router();

const requireJWT = () => {
  const key = process.env.JWT_SECRET;
  if (!key) {
    throw new Error('Missing JWT_SECRET in .env');
  }
  return key;
};

router.post('/register', async (req, res) => {
  console.log('Body nhận từ FE:', req.body);
  try {
    const { username, email, password } = req.body || {};

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Missing username, email or password' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be >= 6 characters' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ message: 'Username already in use' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'Registered successfully' });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      return res.status(409).json({ message: `${field} has been used` });
    }
    console.error('Error while registering:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  console.log('Body nhận từ FE:', req.body);
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Missing email or password' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong email or password' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role, username: user.username },
      requireJWT(),
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    return res.json({ message: 'Log in successfully', token });
  } catch (error) {
    console.error('Error while logging in:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile', isAuth, async (req, res) => {
  try {
    const uid = req.user?._id || req.user?.id;
    if (!uid) return res.status(401).json({ message: 'Not authenticated' });

    const user = await User.findById(uid).select('-password');
    if (!user) return res.status(404).json({ message: 'User does not exist' });
    return res.json(user);
  } catch (error) {
    console.error('Error when getting profile:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) return res.status(404).json({ message: 'User does not exist' });

    return res.json(user);
  } catch (error) {
    console.error('Error when getting profile by id:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/:id/posts', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const skip  = (page - 1) * limit;
    const { search, category } = req.query;

    const filter = { userId: id };
    if (category && mongoose.isValidObjectId(category)) {
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
        .populate('categories', 'name slug'),
      Post.countDocuments(filter),
    ]);

    return res.json({
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    });
  } catch (error) {
    console.error('Error when getting posts by user:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.get('/profile/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    const [totalPosts, distinctCats] = await Promise.all([
      Post.countDocuments({ userId: id }),
      Post.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(id) } },
        { $unwind: { path: '$categories', preserveNullAndEmptyArrays: false } },
        { $group: { _id: '$categories' } },
        { $count: 'count' }
      ])
    ]);

    const totalCategories = distinctCats?.[0]?.count || 0;

    return res.json({ totalPosts, totalCategories });
  } catch (error) {
    console.error('Summary profile error:', error);
    return res.status(500).json({ message: 'server error' });
  }
});



export default router;
