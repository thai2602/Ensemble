import React from "react";
import { Link } from "react-router-dom";
import { API_URL } from '../../config/index';

export default function ProductGrid({ data, themeStyles }) {
    const { products } = data;

    // Render Skeleton or Empty State
    if (!products || products.length === 0) {
        return (
            <section className="py-20 text-center">
                <p style={{ color: "var(--theme-text)" }}>No products found.</p>
            </section>
        );
    }

    return (
        <section className="max-w-7xl mx-auto px-6 py-12">
            <h2
                className="text-4xl font-bold text-center mb-12"
                style={{ color: "var(--theme-primary)" }}
            >
                Our Menu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product) => {
                    // Logic to get image URL: prioritize 'image' (string), then 'images' (array)
                    let rawImg = product.image || product.images?.[0];
                    const imageUrl = rawImg
                        ? (rawImg.startsWith("http") ? rawImg : `${API_URL}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`)
                        : "https://placehold.co/300";

                    return (
                        <Link to={`/product/${product.slug}`} key={product._id} className="block group">
                            <div
                                className="relative rounded-2xl overflow-hidden shadow-lg transition hover:-translate-y-2 hover:shadow-2xl bg-white h-full flex flex-col"
                            >
                                {/* Image */}
                                <div className="h-64 overflow-hidden relative bg-gray-100">
                                    <img
                                        src={imageUrl}
                                        alt={product.title || product.name}
                                        className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                                        onError={(e) => e.currentTarget.src = "https://placehold.co/300"}
                                    />
                                    {/* Overlay Badge */}
                                    <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-sm font-bold shadow" style={{ color: "var(--theme-primary)" }}>
                                        ${product.price}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold mb-2 truncate" style={{ color: "var(--theme-text)" }}>
                                        {product.name || product.title}
                                    </h3>
                                    <p className="text-sm mb-4 line-clamp-2 opacity-75 flex-1" style={{ color: "var(--theme-text)" }}>
                                        {product.description || product.content}
                                    </p>
                                    <button
                                        className="w-full py-3 rounded-xl font-bold transition hover:opacity-90 active:scale-95 mt-auto"
                                        style={{ backgroundColor: "var(--theme-secondary)", color: "var(--theme-primary)" }}
                                        onClick={(e) => {
                                            e.preventDefault(); // Prevent navigation if clicking add to cart
                                            // TODO: Add to cart logic
                                            alert("Added to cart!");
                                        }}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
