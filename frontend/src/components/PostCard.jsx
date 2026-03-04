import { Link } from "react-router-dom";
import defaultImg from "../assets/default-img.jpg";
import { getImageUrl } from '../lib/api';

const PostCard = ({ post }) => {
  if (!post) return null;

  const imgUrl = post.image ? getImageUrl(post.image) : defaultImg;

  const dateStr = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString()
    : "";

  const excerpt =
    typeof post.content === "string"
      ? post.content.replace(/\s+/g, " ").trim()
      : "";

  return (
    <Link
      to={`/blog/${post.slug || post._id}`}
      aria-label={post.title}
      className="group relative block min-w-[300px] h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
    >
      <img
        src={imgUrl}
        alt={post.title || "Blog cover"}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4 text-white">
        {dateStr && (
          <p className="text-xs text-white/80 mb-1">{dateStr}</p>
        )}

        <h3 className="text-lg sm:text-xl font-semibold leading-snug line-clamp-2">
          {post.title || "Untitled"}
        </h3>

        {Array.isArray(post.categories) && post.categories.length > 0 && (
          <div className="mt-2 mb-2 flex flex-wrap gap-2">
            {post.isFeatured && (
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900">
                Featured
              </span>
            )}
            {post.categories.slice(0, 3).map((c) => (
              <span
                key={c._id || c.name}
                className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-900"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-white/90 line-clamp-2">
          {excerpt || "Read the full story →"}
        </p>
      </div>
    </Link>
  );
};

export default PostCard;

const AlbumCard = ({ album }) => {

  return (
    <div id="album-card" className="">  
      <h2 className="text-2xl font-bold mb-4">{album.title}</h2>
      <p className="text-gray-600">{album.description}</p>
    </div>
  );
};

export { AlbumCard };




