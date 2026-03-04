import React from "react";
import { Link } from "react-router-dom";

export default function HeroSplit({ data, themeStyles }) {
    const { shop } = data;

    return (
        <section className="relative w-full min-h-[500px] flex flex-col md:flex-row overflow-hidden">
            {/* Left Content */}
            <div
                className="w-full md:w-1/2 flex items-center justify-center p-12 order-2 md:order-1"
                style={{ backgroundColor: "var(--theme-background)" }}
            >
                <div className="max-w-xl text-left">
                    <h1
                        className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        {shop?.name || "Modern Shop"}
                    </h1>
                    <p
                        className="text-lg md:text-xl mb-8 opacity-90"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {shop?.description || "Experience quality like never before."}
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/shop"
                            className="px-8 py-3 rounded-lg font-bold transition shadow-lg hover:brightness-110"
                            style={{ backgroundColor: "var(--theme-primary)", color: "#fff" }}
                        >
                            Shop Now
                        </Link>
                        <button
                            className="px-8 py-3 rounded-lg font-bold border-2 transition hover:bg-opacity-10"
                            style={{
                                borderColor: "var(--theme-primary)",
                                color: "var(--theme-primary)",
                            }}
                        >
                            Learn More
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Image */}
            <div className="w-full md:w-1/2 h-[400px] md:h-auto relative order-1 md:order-2">
                <img
                    src={shop?.avatar ? shop.avatar : "/default-bg.jpg"}
                    className="w-full h-full object-cover"
                    alt="Hero"
                    onError={(e) => e.currentTarget.src = "https://placehold.co/800x600"}
                />
            </div>
        </section>
    );
}
