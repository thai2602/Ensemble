import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';
import defaultImg from '../assets/default-img.jpg';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'all';

  const [results, setResults] = useState({ products: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(type === 'products' ? 'products' : type === 'posts' ? 'posts' : 'all');

  useEffect(() => {
    if (query) {
      performSearch();
    }
  }, [query, type]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const searchResults = { products: [], posts: [] };

      if (type === 'all' || type === 'products') {
        const { data: productsData } = await api.get('/products', {
          params: { search: query }
        });
        searchResults.products = Array.isArray(productsData) ? productsData : [];
      }

      if (type === 'all' || type === 'posts') {
        const { data: postsData } = await api.get('/posts', {
          params: { search: query }
        });
        searchResults.posts = Array.isArray(postsData) ? postsData : [];
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.products.length + results.posts.length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Search Results
            </h1>
            <p className="text-gray-600 text-lg">
              for "<span className="font-semibold text-gray-900">{query}</span>"
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-3 py-1 bg-gray-900 text-white rounded-full font-medium">
              {totalResults} result{totalResults !== 1 ? 's' : ''}
            </span>
            {results.products.length > 0 && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
                {results.products.length} product{results.products.length !== 1 ? 's' : ''}
              </span>
            )}
            {results.posts.length > 0 && (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                {results.posts.length} post{results.posts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          <button
            onClick={() => setActiveTab('all')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${activeTab === 'all'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            All <span className="ml-2 text-sm opacity-75">({totalResults})</span>
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${activeTab === 'products'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Products <span className="ml-2 text-sm opacity-75">({results.products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 px-6 py-3 font-semibold rounded-lg transition-all ${activeTab === 'posts'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
          >
            Posts <span className="ml-2 text-sm opacity-75">({results.posts.length})</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mb-6"></div>
            <p className="text-lg font-medium text-gray-700">Searching for results...</p>
            <p className="text-sm text-gray-500 mt-2">This won't take long</p>
          </div>
        ) : (
          <>
            {/* Products Section */}
            {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                  <span className="text-sm text-gray-500 font-medium">
                    {results.products.length} found
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {results.products.map((product) => (
                    <ProductCard key={product._id} p={product} />
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {(activeTab === 'all' || activeTab === 'posts') && results.posts.length > 0 && (
              <div className="mb-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
                  <span className="text-sm text-gray-500 font-medium">
                    {results.posts.length} found
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.posts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 cursor-pointer flex flex-col h-full"
                    >
                      <div className="relative overflow-hidden">
                        <img
                          src={post.image || defaultImg}
                          alt={post.title}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed flex-1">
                          {post.summary}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span>•</span>
                          {post.categories?.length > 0 && (
                            <span>{post.categories[0].name}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {totalResults === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No results found
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  We couldn't find anything matching "<span className="font-semibold">{query}</span>".
                  Try different keywords or browse our collections.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link
                    to="/shop"
                    className="px-8 py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                  >
                    Browse Products
                  </Link>
                  <Link
                    to="/blog"
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-900 hover:bg-gray-50 transition-all"
                  >
                    Browse Posts
                  </Link>
                  <Link
                    to="/albums"
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-900 hover:bg-gray-50 transition-all"
                  >
                    View Albums
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
