import mongoose from 'mongoose';
import slugify from 'slugify';
import Post from '../models/posts.js';
import Shop from '../models/shop.js';
import { AppError } from '../utils/errors.js';

class PostService {
  async createPost(postData) {
    const { userId, title, summary, content, image, categories } = postData;

    let categoryArray = [];
    if (categories) {
      categoryArray = (Array.isArray(categories) ? categories : JSON.parse(categories))
        .map(id => new mongoose.Types.ObjectId(id));
    }

    const newPost = await Post.create({
      userId,
      title,
      summary,
      content,
      image,
      categories: categoryArray,
      slug: slugify(title, { lower: true, strict: true }),
    });

    return newPost;
  }

  async getAllPosts(filters = {}) {
    const { category, shop } = filters;
    const filter = {};
    
    if (category) filter.categories = category;
    if (shop && mongoose.isValidObjectId(shop)) filter.shop = shop;

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'username email')
      .populate({ path: 'categories', select: 'name slug' })
      .populate({ path: 'shop', select: 'name slug avatar' });

    return posts;
  }

  async getMyPosts(userId, options = {}) {
    const { page = 1, limit = 10, category, search } = options;
    const skip = (page - 1) * limit;

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

    return {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      items,
    };
  }

  async getPostBySlug(slug) {
    const post = await Post.findOne({ slug })
      .populate('userId', 'username email')
      .populate({ path: 'categories', select: 'name slug' })
      .populate({ path: 'shop', select: 'name slug avatar' });

    return post;
  }

  async updatePost(postId, updateData, userId) {
    const { shop } = updateData;
    const update = { ...updateData };

    // Validate shop if provided
    if (shop !== undefined) {
      if (shop === null || shop === '') {
        update.shop = null;
      } else {
        if (!mongoose.isValidObjectId(shop)) {
          throw new AppError('Invalid shop id', 400);
        }
        const shopExists = await Shop.findById(shop).select('_id');
        if (!shopExists) {
          throw new AppError('Shop not found', 404);
        }
        update.shop = shop;
      }
    }

    // Check ownership
    const existingPost = await Post.findById(postId);
    if (!existingPost) {
      throw new AppError('Post not found', 404);
    }
    if (existingPost.userId.toString() !== userId.toString()) {
      throw new AppError('Unauthorized to update this post', 403);
    }

    const post = await Post.findByIdAndUpdate(postId, update, { new: true })
      .populate('userId', 'username email')
      .populate({ path: 'categories', select: 'name slug' })
      .populate({ path: 'shop', select: 'name slug avatar' });

    return post;
  }

  async deletePost(postId, userId) {
    const post = await Post.findById(postId);
    
    if (!post) {
      throw new AppError('Post not found', 404);
    }
    
    if (post.userId.toString() !== userId.toString()) {
      throw new AppError('Unauthorized to delete this post', 403);
    }

    await Post.findByIdAndDelete(postId);
  }
}

export default new PostService();
