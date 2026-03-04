import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api, { getImageUrl } from "../../lib/api";
import defaultImg from "../../assets/default-img.jpg";

export default function GalleryGrid({ data }) {
    const { albums, shop } = data;
    // Get latest 6 photos from albums flat list for demo, or just cover images of albums
    const photos = albums?.slice(0, 6) || [];

    if (photos.length === 0) return null;

    return (
        <section className="py-20 px-6 transition-colors duration-500" style={{ backgroundColor: "var(--theme-secondary)" }}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold mb-4" style={{ color: "var(--theme-primary)" }}>
                        Shop Albums
                    </h2>
                    <p className="max-w-2xl mx-auto text-lg opacity-80" style={{ color: "var(--theme-text)" }}>
                        Explore our exclusive product collections.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {photos.map((album, idx) => (
                        <AlbumCard key={idx} album={album} shop={shop} />
                    ))}
                </div>
            </div>
        </section>
    );
}

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
        const img = p.image || p.images?.[0]; // Support both legacy array and new string format
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
    const shopId = fullAlbum?.shopId || album.shopId || shop?._id;
    const albumLink = shopId
        ? `/shop/${shopId}/albums/${album.slug || album._id}`
        : '#';

    return (
        <div
            className="group rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white"
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
                    <h3 className="text-xl font-bold mb-2 line-clamp-1 transition" style={{ color: "var(--theme-text)" }}>
                        {album.name || 'Untitled Album'}
                    </h3>

                    {album.description && (
                        <p className="text-sm line-clamp-2 mb-4 opacity-80" style={{ color: "var(--theme-text)" }}>
                            {album.description}
                        </p>
                    )}

                    {/* Shop Info - simplified for internal view since we are already IN the shop */}
                    <div className="flex items-center gap-2 pt-4 border-t" style={{ borderColor: "var(--theme-secondary)" }}>
                        <span className="text-xs font-semibold" style={{ color: "var(--theme-primary)" }}>
                            {album.productCount || album.items?.length || 0} {(album.productCount || album.items?.length) === 1 ? 'item' : 'items'}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
};
