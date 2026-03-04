import React from "react";

export default function StorySection({ data, themeStyles }) {
    const { storyContent } = data; // content passed from parent

    return (
        <section className="py-20 px-6">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
                {/* Single Image Area */}
                <div className="w-full md:w-1/2">
                    <img
                        src={storyContent?.image || "https://images.unsplash.com/photo-1442512595331-e89e7385a861?w=800"}
                        className="rounded-2xl shadow-xl w-full h-[400px] object-cover"
                        alt="Our Story"
                    />
                </div>

                {/* Text Content */}
                <div className="w-full md:w-1/2">
                    <span className="text-sm font-bold uppercase tracking-widest mb-2 block" style={{ color: "var(--theme-accent)" }}>
                        {storyContent?.tagline || "Our Story"}
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: "var(--theme-primary)" }}>
                        {storyContent?.title || "Tradition Meets Modern Taste"}
                    </h2>
                    <p className="text-lg leading-relaxed mb-6 opacity-80" style={{ color: "var(--theme-text)" }}>
                        {storyContent?.description || "We started with a simple mission: to bring the authentic flavors of quality ingredients to your table. Every product is crafted with care, using recipes passed down through generations but refined for the modern palate."}
                    </p>
                    <div className="flex gap-8 border-t pt-8" style={{ borderColor: "var(--theme-secondary)" }}>
                        <div>
                            <h4 className="text-3xl font-bold" style={{ color: "var(--theme-primary)" }}>{storyContent?.stats?.[0]?.value || "10+"}</h4>
                            <p className="text-sm opacity-70" style={{ color: "var(--theme-text)" }}>{storyContent?.stats?.[0]?.label || "Years of Service"}</p>
                        </div>
                        <div>
                            <h4 className="text-3xl font-bold" style={{ color: "var(--theme-primary)" }}>{storyContent?.stats?.[1]?.value || "5k+"}</h4>
                            <p className="text-sm opacity-70" style={{ color: "var(--theme-text)" }}>{storyContent?.stats?.[1]?.label || "Happy Customers"}</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
