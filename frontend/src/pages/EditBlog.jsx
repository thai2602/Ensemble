import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useToast } from '../components/ToastProvider';

export default function EditBlog() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    categories: []
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [slug]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postRes, catsRes] = await Promise.all([
        api.get(`/posts/${slug}`),
        api.get('/categories')
      ]);

      const post = postRes.data;
      setFormData({
        title: post.title,
        summary: post.summary,
        content: post.content,
        categories: post.categories.map(c => c._id)
      });
      setCategories(catsRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load post data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (catId) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(catId)
        ? prev.categories.filter(id => id !== catId)
        : [...prev.categories, catId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.summary.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.categories.length === 0) {
      setError('Please select at least one category');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const postRes = await api.get(`/posts/${slug}`);
      const postId = postRes.data._id;

      await api.patch(`/posts/${postId}`, {
        title: formData.title,
        summary: formData.summary,
        content: formData.content,
        categories: formData.categories
      });

      addToast('Post updated successfully!', 'success');
      navigate(`/blog/${slug}`);
    } catch (err) {
      console.error('Error updating post:', err);
      const errorMsg = err.response?.data?.message || 'Failed to update post';
      setError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6">Edit Blog Post</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Enter post title"
              />
            </div>

            {/* Summary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Summary <span className="text-red-500">*</span>
              </label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Brief summary of your post"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="12"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                placeholder="Write your post content here..."
              />
            </div>

            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categories <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <label
                    key={cat._id}
                    className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition ${formData.categories.includes(cat._id)
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-orange-500'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat._id)}
                      onChange={() => handleCategoryChange(cat._id)}
                      className="hidden"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Updating...' : 'Update Post'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/blog/${slug}`)}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
