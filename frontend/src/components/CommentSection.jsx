import { useState, useEffect } from 'react';
import api from '../lib/api';
import defaultImg from '../assets/default-img.jpg';
import { AiOutlineLike, AiOutlineDislike, AiFillLike, AiFillDislike } from 'react-icons/ai';
import { BsThreeDotsVertical } from 'react-icons/bs';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadComments();
    checkAuth();
  }, [postId]);

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));

        setUser(payload);
      } catch (e) {
        console.error('Invalid token');
      }
    }
  };

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/comments/post/${postId}`);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      await api.post(`/comments/post/${postId}`, {
        content: newComment
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setLoading(true);
    try {
      await api.post(`/comments/post/${postId}`, {
        content: replyContent,
        parentId
      });
      setReplyContent('');
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error('Error posting reply:', error);
      alert(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await api.patch(`/comments/${commentId}`, {
        content: newContent
      });
      await loadComments();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return;
    try {
      await api.post(`/comments/${commentId}/like`);
      await loadComments();
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  const handleDislike = async (commentId) => {
    if (!user) return;
    try {
      await api.post(`/comments/${commentId}/dislike`);
      await loadComments();
    } catch (error) {
      console.error('Error disliking comment:', error);
    }
  };

  return (
    <div className="mt-8 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6">Comments ({comments.length})</h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows="3"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">Please login to comment</p>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            user={user}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            replyContent={replyContent}
            setReplyContent={setReplyContent}
            handleSubmitReply={handleSubmitReply}
            handleDeleteComment={handleDeleteComment}
            handleUpdateComment={handleUpdateComment}
            handleLike={handleLike}
            handleDislike={handleDislike}
            loading={loading}
          />
        ))}
      </div>

      {comments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No comments yet. Be the first to comment!
        </div>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  user,
  replyTo,
  setReplyTo,
  replyContent,
  setReplyContent,
  handleSubmitReply,
  handleDeleteComment,
  handleUpdateComment,
  handleLike,
  handleDislike,
  loading
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showMenu, setShowMenu] = useState(false);
  
  // Check ownership - user.id or user._id depending on token structure
  const userId = user?._id || user?.id;
  const commentUserId = comment.userId?._id || comment.userId?.id || comment.userId;
  const isOwner = user && userId && (userId === commentUserId || userId.toString() === commentUserId.toString());
  
  const showReplyForm = replyTo === comment._id;
  const userLiked = user && userId && comment.likes?.includes(userId);
  const userDisliked = user && userId && comment.dislikes?.includes(userId);
  


  const handleEdit = async () => {
    if (!editContent.trim()) return;
    await handleUpdateComment(comment._id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-4">
      <img
        src={comment.userId.avatar || defaultImg}
        alt={comment.userId.username}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">
              {comment.userId.username}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleDateString()}
                {comment.updatedAt !== comment.createdAt && ' (edited)'}
              </span>
              
              {/* Three dots menu */}
              {isOwner && !isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded-full transition text-gray-600"
                    title="Options"
                  >
                    <BsThreeDotsVertical size={16} />
                  </button>
                  
                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteComment(comment._id);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500"
                rows="3"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 text-sm">
          {/* Like/Dislike */}
          {user && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleLike(comment._id)}
                className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition"
              >
                {userLiked ? <AiFillLike size={18} className="text-orange-600" /> : <AiOutlineLike size={18} />}
                <span className="text-xs">{comment.likes?.length || 0}</span>
              </button>
              <button
                onClick={() => handleDislike(comment._id)}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
              >
                {userDisliked ? <AiFillDislike size={18} className="text-red-600" /> : <AiOutlineDislike size={18} />}
                <span className="text-xs">{comment.dislikes?.length || 0}</span>
              </button>
            </div>
          )}

          {user && !isEditing && (
            <button
              onClick={() => setReplyTo(showReplyForm ? null : comment._id)}
              className="text-gray-600 hover:text-gray-800 font-medium"
            >
              Reply
            </button>
          )}
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <form onSubmit={(e) => handleSubmitReply(e, comment._id)} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              rows="2"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !replyContent.trim()}
                className="px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </form>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-200">
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply._id}
                reply={reply}
                user={user}
                handleDeleteComment={handleDeleteComment}
                handleUpdateComment={handleUpdateComment}
                handleLike={handleLike}
                handleDislike={handleDislike}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReplyItem({ reply, user, handleDeleteComment, handleUpdateComment, handleLike, handleDislike }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(reply.content);
  const [showMenu, setShowMenu] = useState(false);
  
  // Check ownership - user.id or user._id depending on token structure
  const userId = user?._id || user?.id;
  const replyUserId = reply.userId?._id || reply.userId?.id || reply.userId;
  const isOwner = user && userId && (userId === replyUserId || userId.toString() === replyUserId.toString());
  
  const userLiked = user && userId && reply.likes?.includes(userId);
  const userDisliked = user && userId && reply.dislikes?.includes(userId);

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    await handleUpdateComment(reply._id, editContent);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      <img
        src={reply.userId.avatar || defaultImg}
        alt={reply.userId.username}
        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-3 relative">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sm text-gray-900">
              {reply.userId.username}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {new Date(reply.createdAt).toLocaleDateString()}
                {reply.updatedAt !== reply.createdAt && ' (edited)'}
              </span>
              
              {/* Three dots menu */}
              {isOwner && !isEditing && (
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 hover:bg-gray-200 rounded-full transition text-gray-600"
                    title="Options"
                  >
                    <BsThreeDotsVertical size={14} />
                  </button>
                  
                  {showMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-6 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteComment(reply._id);
                            setShowMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isEditing ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-orange-500 text-sm"
                rows="2"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleEdit}
                  className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(reply.content);
                  }}
                  className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {reply.content}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-3 mt-1 text-xs">
          {/* Like/Dislike */}
          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleLike(reply._id)}
                className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition"
              >
                {userLiked ? <AiFillLike size={14} className="text-orange-600" /> : <AiOutlineLike size={14} />}
                <span>{reply.likes?.length || 0}</span>
              </button>
              <button
                onClick={() => handleDislike(reply._id)}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition"
              >
                {userDisliked ? <AiFillDislike size={14} className="text-red-600" /> : <AiOutlineDislike size={14} />}
                <span>{reply.dislikes?.length || 0}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
