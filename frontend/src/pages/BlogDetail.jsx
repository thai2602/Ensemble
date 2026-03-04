import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import defaultImg from '../assets/default-img.jpg';
import RelatedBlogsVertical from '../sub/RelatedBlog';
import UserInfoCard from '../sub/UserInfoCard';
import CommentSection from '../components/CommentSection';
import { useToast } from '../components/ToastProvider';

import api from '../lib/api';
import toAbsUrl from '../lib/toAbsUrl';
import TagShopButton from '../components/TagShopButton';

export default function BlogDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [user, setUser] = useState(null);
  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get(`/posts/${slug}`);
      setPost(data);

      let rel = [];
      if (data?.shop?._id) {
        const r = await api.get('/posts', { params: { shop: data.shop._id } });
        rel = Array.isArray(r.data) ? r.data : [];
      } else if (data?.categories?.[0]?._id) {
        const r = await api.get('/posts', { params: { category: data.categories[0]._id } });
        rel = Array.isArray(r.data) ? r.data : [];
      }
      setRelatedPosts(rel.filter(p => p.slug !== data.slug).slice(0, 5));
    } catch (err) {
      console.error('Load post failed', err);
      setError(err?.response?.data?.message || 'Load failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
    checkAuth();
  }, [slug]);

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setDeleting(true);
    try {
      await api.delete(`/posts/${post._id}`);
      addToast('Post deleted successfully', 'success');
      navigate('/blog');
    } catch (err) {
      console.error('Delete failed:', err);
      addToast(err?.response?.data?.message || 'Failed to delete post', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <p className="text-red-500">{error}</p>;
  if (loading || !post) return <p>Loading...</p>;

  const bgUrl = post.image ? toAbsUrl(post.image) : defaultImg;

  return (
    <div id="blog-detail-page" className="min-h-screen bg-gradient-to-b from-green-50 to-white pt-8 pb-12">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 px-6">
        <div className="flex-1 rounded-xl shadow-md overflow-hidden bg-white">
          <div
            className="relative h-80 w-full bg-cover bg-center"
            style={{ backgroundImage: `url('${bgUrl}')` }}
          >
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 text-white">
              <p className="text-xs text-gray-200">
                {new Date(post.createdAt).toDateString()}
              </p>
              <h2 className="mb-3 text-2xl font-semibold leading-snug">{post.title}</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {post.isFeatured && (
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-800 shadow-sm">
                    Featured
                  </span>
                )}
                {post?.categories?.map((c) => (
                  <span
                    key={c._id}
                    className="rounded-full bg-green-100/90 backdrop-blur px-3 py-1 text-xs font-semibold text-green-800 shadow-sm"
                  >
                    {c.name}
                  </span>
                ))}
              </div>
              {/* <button className="w-max rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-orange-600">
              Intro
            </button> */}
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-semibold tracking-tight">{post.title}</h1>
              {user && (user.id === post.userId._id || user._id === post.userId._id) && (
                <div className="flex gap-2">
                  <Link
                    to={`/blog/${post.slug}/edit`}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm font-medium"
                  >
                    Edit Post
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
            <article className="prose max-w-none prose-p:my-4 prose-img:rounded-lg mt-4 text-gray-800">
              <p className="whitespace-pre-line">{post.content}</p>
            </article>
          </div>

          {/* Tag shop */}
          <div className="px-6 pb-6 mt-2 flex items-center gap-3">
            {post.shop ? (
              <div className="rounded-xl border bg-white px-3 py-2 flex items-center gap-2">
                <img
                  src={post.shop?.avatar || defaultImg}
                  className="h-7 w-7 rounded-full object-cover"
                  alt={post.shop?.name}
                />
                <span className="text-sm text-gray-500">Tagged shop:</span>
                <Link to={`/shop/${post.shop.slug || post.shop._id}`} className="font-medium hover:underline">
                  {post.shop.name}
                </Link>
              </div>
            ) : (
              <div className="text-sm text-gray-500">No shop tagged</div>
            )}

            <TagShopButton postId={post._id} onDone={fetchPost} />
          </div>

          {/* Comment Section */}
          <div className="px-6 pb-6">
            <CommentSection postId={post._id} />
          </div>
        </div>

        <div className="w-60 bg-white h-fit">
          <UserInfoCard userId={post.userId._id} />
          <RelatedBlogsVertical posts={relatedPosts} />
        </div>
      </div>
    </div>
  );
}
