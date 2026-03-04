import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listAlbums } from '../lib/albumsApi';
import api, { getImageUrl } from '../lib/api';
import defaultImg from '../assets/default-img.jpg';

const Albums = () => {
  const [albums, setAlbums] = useState([]);
  const [shops, setShops] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch albums
        const albumsData = await listAlbums(null, { page: 1, limit: 100 });
        const albumsList = albumsData?.items || [];

        if (albumsList.length === 0) {
          setLoading(false);
          return;
        }

        // Get unique shop IDs
        const shopIds = [...new Set(albumsList.map(a => a.shopId).filter(Boolean))];

        // Fetch shop details for each album
        const shopsData = {};
        await Promise.all(
          shopIds.map(async (shopId) => {
            try {
              const res = await api.get(`/shop/id/${shopId}`);
              shopsData[shopId] = res.data;
            } catch (err) {
              console.error(`Error fetching shop ${shopId}:`, err);
            }
          })
        );

        setShops(shopsData);
        setAlbums(albumsList);
      } catch (err) {
        console.error('Error loading albums:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Albums</h1>
          <p className="text-lg text-gray-600 mb-6">Explore curated collections from creative shops</p>

          {/* Intro Content */}
          <div className="mt-6 space-y-4 text-gray-700 max-w-4xl">
            <p className="leading-relaxed">
              Discover unique collections curated by talented creators and shop owners. Each album tells
              a story through carefully selected products that reflect passion, creativity, and craftsmanship.
            </p>
            <p className="leading-relaxed">
              From minimalist designs to vibrant collections, our albums showcase the best of what our
              creative community has to offer. Click on any album to explore the full collection.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
              <AlbumCard
                key={album._id}
                album={album}
                shop={shops[album.shopId]}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 text-lg">No albums found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AlbumCard = ({ album, shop }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [fullAlbum, setFullAlbum] = useState(null);

  // Fetch full album with populated products
  useEffect(() => {
    const fetchFullAlbum = async () => {
      // If album already has populated products, skip
      const hasPopulatedProducts = album.items?.some(
        item => typeof item.product === 'object' && item.product !== null
      );

      if (hasPopulatedProducts && album.shopId) {
        setFullAlbum(album);
        return;
      }

      // Otherwise fetch full album details
      try {
        const res = await api.get(`/albums/${album._id}`);
        setFullAlbum(res.data);
      } catch (err) {
        console.error('Error fetching full album:', err);
        setFullAlbum(album); // Fallback to original album
      }
    };

    fetchFullAlbum();
  }, [album._id, album.shopId, album.items]);

  // Use fullAlbum if available, otherwise use album
  const albumData = fullAlbum || album;

  // Use coverImage as primary image source
  const coverImage = albumData.coverImage ? getImageUrl(albumData.coverImage) : null;

  // Get products from album.items (should be populated in fullAlbum)
  const products = (albumData.items || [])
    .map(item => {
      if (typeof item.product === 'object' && item.product !== null) {
        return item.product;
      }
      return null;
    })
    .filter(Boolean)
    .slice(0, 5);

  // Build images array: coverImage first, then product images
  const images = [];

  if (coverImage) {
    images.push(coverImage);
  }

  products.forEach(p => {
    const img = p.image || p.images?.[0];
    if (img) {
      const fullUrl = getImageUrl(img);
      if (!images.includes(fullUrl)) {
        images.push(fullUrl);
      }
    }
  });

  // Fallback to default image if no images found
  if (images.length === 0) {
    images.push(defaultImg);
  }

  // Limit to 5 images for slider
  const displayImages = images.slice(0, 5);
  const imageCount = displayImages.length;

  // // Debug
  // if (album.name === 'Winter') {
  //   console.log('Winter album images:', {
  //     coverImage: album.coverImage,
  //     itemsCount: album.items?.length,
  //     productsCount: products.length,
  //     imagesArray: images,
  //     displayImages
  //   });
  // }

  // Auto slide when hovered
  useEffect(() => {
    if (!isHovered || imageCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % imageCount);
    }, 1000);

    return () => clearInterval(interval);
  }, [isHovered, imageCount]);

  const shopAvatar = shop?.avatar ? getImageUrl(shop.avatar) : defaultImg;

  // Use shopId from fullAlbum if available, otherwise from album
  const shopId = fullAlbum?.shopId || album.shopId;
  const albumLink = shopId
    ? `/shop/${shopId}/albums/${album.slug || album._id}`
    : '#';

  return (
    <div
      className="group bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-purple-100 hover:border-purple-200 border border-transparent transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      <Link
        to={albumLink}
        className="block"
        onClick={(e) => {
          if (albumLink === '#') {
            e.preventDefault();
          }
        }}
      >
        {/* Image Slider */}
        <div className="relative h-64 overflow-hidden bg-gray-100">
          {displayImages.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`${album.name} - ${idx + 1}`}
              onError={(e) => (e.currentTarget.src = defaultImg)}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${idx === currentImageIndex
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-110'
                } ${isHovered ? 'group-hover:scale-110' : ''}`}
            />
          ))}

          {/* Image indicators */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {displayImages.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/60'
                    }`}
                />
              ))}
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-gray-700 transition">
            {album.name || 'Untitled Album'}
          </h3>

          {album.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-4">
              {album.description}
            </p>
          )}

          {/* Shop Info */}
          {shop && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <img
                src={shopAvatar}
                alt={shop.name}
                onError={(e) => (e.currentTarget.src = defaultImg)}
                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {shop.name}
                </p>
                <p className="text-xs text-gray-500">
                  {album.productCount || album.items?.length || 0} {(album.productCount || album.items?.length) === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default Albums;