import express from 'express';
import { isAuth } from '../middlewares/auth.js';
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
  dislikeComment
} from '../controllers/comment.controller.js';

const router = express.Router();

// Get all comments for a post
router.get('/post/:postId', getComments);

// Create a new comment (requires auth)
router.post('/post/:postId', isAuth, createComment);

// Update a comment (requires auth)
router.patch('/:commentId', isAuth, updateComment);

// Delete a comment (requires auth)
router.delete('/:commentId', isAuth, deleteComment);

// Like a comment (requires auth)
router.post('/:commentId/like', isAuth, likeComment);

// Dislike a comment (requires auth)
router.post('/:commentId/dislike', isAuth, dislikeComment);

export default router;
