import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../lib/api';
import defaultImg from '../assets/default-img.jpg';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/posts'),
      api.get('/categories')
    ])
      .then(([postsRes, catsRes]) => {
        setPosts(postsRes.data);
        setCategories(catsRes.data);
      })
      .catch(err => console.error('Error loading data:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredPosts = selectedCategory
    ? posts.filter(post =>
      post.categories?.some(cat => cat.slug === selectedCategory)
    )
    : posts;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Blog</h1>
          <p className="text-gray-600">Discover stories, tips, and insights from our community</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20 border border-gray-200">
              <div className="border-b border-gray-200 w-full">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Categories</h2>
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === null
                      ? 'font-bold'
                      : 'text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200'
                      }`}
                  >
                    All Posts
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat._id}>
                    <button
                      onClick={() => setSelectedCategory(cat.slug)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition ${selectedCategory === cat.slug
                        ? 'font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:border hover:border-gray-200'
                        }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedCategory
                  ? `${categories.find(c => c.slug === selectedCategory)?.name || selectedCategory}`
                  : 'Latest Posts'}
              </h2>
              <p className="text-gray-600 mt-1">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200" />
                    <div className="p-6 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.map(post => (
                  <BlogCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">No posts found for this category.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const BlogCard = ({ post }) => {
  const imgUrl = post.image ? getImageUrl(post.image) : defaultImg;

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
    : '';

  return (
    <Link
      to={`/blog/${post.slug || post._id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imgUrl}
          alt={post.title}
          onError={(e) => (e.currentTarget.src = defaultImg)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="p-6">
        {dateStr && (
          <p className="text-xs text-gray-500 mb-2">{dateStr}</p>
        )}

        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition">
          {post.title || 'Untitled'}
        </h3>

        {post.summary && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {post.summary}
          </p>
        )}

        {Array.isArray(post.categories) && post.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.categories.slice(0, 3).map(cat => (
              <span
                key={cat._id}
                className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100"
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default Blog;

