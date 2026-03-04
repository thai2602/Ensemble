import React from 'react'
import { Link } from 'react-router-dom'
import defaultImg from '../assets/default-img.jpg'
import { API_URL } from '../config';

export default function RelatedBlogsVertical({ posts = [], title = 'Related Blogs' }) {
  const getImageUrl = (img) => {
    if (!img) return defaultImg
    return img.startsWith('http') ? img : `${API_URL}${img}`
  }
  
  return (
    <aside className="w-full max-w-md shadow-md ">
      <h3 className="text-lg font-semibold mb-3 px-3">{title}</h3>

      <div className="flex flex-col gap-3">
        {posts.length === 0 ? (
          <div className="px-3 py-4 bg-white rounded-lg shadow-sm text-sm text-gray-500">
            No related posts.
          </div>
        ) : (
          posts.map((p) => {
            const imgSrc = getImageUrl(p.image)
            return (
              <Link
                key={p.id || p.slug}
                to={p.slug ? `/blog/${p.slug}` : '#'}
                className="group flex items-start gap-3 bg-white rounded-lg p-3 hover:shadow-lg transition-shadow duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-20 h-14 rounded-md overflow-hidden bg-gray-100">
                  <img
                    src={imgSrc}
                    alt={p.title || 'Blog'}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.target.src = defaultImg)}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-indigo-600">
                    {p.title || 'No title'}
                  </h4>

                  <div className="mt-1 text-xs text-gray-500 flex items-center gap-2">
                    <time dateTime={p.createdAt}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('vi-VN') : 'Date unknown'}
                    </time>
                    {p.author && <span>• {p.author}</span>}
                  </div>

                  {p.excerpt && (
                    <p className="mt-2 text-xs text-gray-600 line-clamp-2">{p.excerpt}</p>
                  )}

                  {p.tag && (
                    <div className="mt-2">
                      <span className="inline-block text-[11px] px-2 py-0.5 bg-gray-100 rounded-full">
                        {p.tag}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </aside>
  )
}
