import Comment from '../models/comment.js';
import Post from '../models/posts.js';
import mongoose from 'mongoose';

// Get comments for a post
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const comments = await Comment.find({ postId, parentId: null })
      .sort({ createdAt: -1 })
      .populate('userId', 'username avatar')
      .lean();

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .sort({ createdAt: 1 })
          .populate('userId', 'username avatar')
          .lean();
        return { ...comment, replies };
      })
    );

    res.json(commentsWithReplies);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: 'Error fetching comments' });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parentId } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If parentId provided, check if parent comment exists
    if (parentId) {
      if (!mongoose.isValidObjectId(parentId)) {
        return res.status(400).json({ message: 'Invalid parent comment ID' });
      }
      const parentComment = await Comment.findById(parentId);
      if (!parentComment) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    const newComment = await Comment.create({
      postId,
      userId,
      content,
      parentId: parentId || null
    });

    const populatedComment = await Comment.findById(newComment._id)
      .populate('userId', 'username avatar')
      .lean();

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ message: 'Error creating comment' });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    comment.content = content;
    comment.updatedAt = Date.now();
    await comment.save();

    const updatedComment = await Comment.findById(commentId)
      .populate('userId', 'username avatar')
      .lean();

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment and its replies
    await Comment.deleteMany({ 
      $or: [
        { _id: commentId },
        { parentId: commentId }
      ]
    });

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
};

// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove from dislikes if exists
    comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId.toString());

    // Toggle like
    const likeIndex = comment.likes.findIndex(id => id.toString() === userId.toString());
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({ 
      likes: comment.likes.length, 
      dislikes: comment.dislikes.length,
      userLiked: likeIndex === -1,
      userDisliked: false
    });
  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Error liking comment' });
  }
};

// Dislike a comment
export const dislikeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
      return res.status(400).json({ message: 'Invalid comment ID' });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Remove from likes if exists
    comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());

    // Toggle dislike
    const dislikeIndex = comment.dislikes.findIndex(id => id.toString() === userId.toString());
    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    } else {
      comment.dislikes.push(userId);
    }

    await comment.save();

    res.json({ 
      likes: comment.likes.length, 
      dislikes: comment.dislikes.length,
      userLiked: false,
      userDisliked: dislikeIndex === -1
    });
  } catch (error) {
    console.error('Error disliking comment:', error);
    res.status(500).json({ message: 'Error disliking comment' });
  }
};
