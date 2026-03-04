import postService from '../services/post.service.js';
import { getFileUrl } from '../utils/fileHelper.js';

class PostController {
  async createPost(req, res, next) {
    try {
      const userId = req.user._id;
      const imageUrl = req.file ? getFileUrl(`uploads/${req.file.filename}`) : '';
      const postData = { ...req.body, userId, image: imageUrl };
      
      const newPost = await postService.createPost(postData);
      res.status(201).json(newPost);
    } catch (error) {
      next(error);
    }
  }

  async getAllPosts(req, res, next) {
    try {
      const { category, shop } = req.query;
      const posts = await postService.getAllPosts({ category, shop });
      res.json(posts);
    } catch (error) {
      next(error);
    }
  }

  async getMyPosts(req, res, next) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, category, search } = req.query;
      
      const result = await postService.getMyPosts(userId, {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        search
      });
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getPostBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const post = await postService.getPostBySlug(slug);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      next(error);
    }
  }

  async updatePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      const updatedPost = await postService.updatePost(id, req.body, userId);
      res.json(updatedPost);
    } catch (error) {
      next(error);
    }
  }

  async deletePost(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user._id;
      
      await postService.deletePost(id, userId);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new PostController();
