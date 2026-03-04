import React from "react";
import { Link } from "react-router-dom";

export default function HeroClassic({ data, themeStyles }) {
    const { shop } = data;
    // Note: themeStyles.palette is available if needed, 
    // but we prefer using CSS variables injected by parent.

    return (
        <section className="relative w-full h-[600px] flex items-center justify-center text-center overflow-hidden">
            {/* Background Overlay */}
            <div
                className="absolute inset-0 opacity-20 z-0"
                style={{ backgroundColor: "var(--theme-primary)" }}
            ></div>

            <div className="relative z-10 max-w-4xl px-6">
                <h1
                    className="text-5xl md:text-7xl font-bold mb-6"
                    style={{ color: "var(--theme-primary)" }}
                >
                    {shop?.name || "Welcome to Our Shop"}
                </h1>
                <p
                    className="text-xl md:text-2xl mb-8 opacity-80"
                    style={{ color: "var(--theme-text)" }}
                >
                    {shop?.description || "Discover our amazing products."}
                </p>
                <Link
                    to="/shop"
                    className="inline-block px-8 py-4 rounded-full font-bold text-lg transition transform hover:scale-105 shadow-xl"
                    style={{
                        backgroundColor: "var(--theme-accent)",
                        color: "#ffffff"
                    }}
                >
                    Explore Collection
                </Link>
            </div>
        </section>
    );
}
