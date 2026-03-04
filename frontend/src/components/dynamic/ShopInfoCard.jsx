import React from "react";
import { FaMapMarkerAlt, FaPhone, FaEnvelope } from "react-icons/fa";

export default function ShopInfoCard({ data, themeStyles }) {
    const { shop } = data;

    return (
        <section className="max-w-7xl mx-auto px-6 py-12">
            <div
                className="relative rounded-2xl overflow-hidden shadow-xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-8"
                style={{ backgroundColor: "var(--theme-secondary)" }}
            >
                <div className="flex-1">
                    <h2
                        className="text-3xl font-bold mb-4"
                        style={{ color: "var(--theme-primary)" }}
                    >
                        Visit Us
                    </h2>
                    <p
                        className="text-lg mb-6 opacity-90"
                        style={{ color: "var(--theme-text)" }}
                    >
                        {shop?.description}
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-center md:justify-start gap-3" style={{ color: "var(--theme-text)" }}>
                            <FaMapMarkerAlt style={{ color: "var(--theme-accent)" }} />
                            <span>{shop?.address || "123 Street, HCM City"}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3" style={{ color: "var(--theme-text)" }}>
                            <FaPhone style={{ color: "var(--theme-accent)" }} />
                            <span>{shop?.phone || "0123-456-789"}</span>
                        </div>
                        <div className="flex items-center justify-center md:justify-start gap-3" style={{ color: "var(--theme-text)" }}>
                            <FaEnvelope style={{ color: "var(--theme-accent)" }} />
                            <span>{shop?.email || "contact@shop.com"}</span>
                        </div>
                    </div>
                </div>

                <div className="w-full md:w-1/3 h-64 rounded-xl overflow-hidden shadow-inner bg-white/50">
                    {/* Simple Map Placeholder */}
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                        Map View
                    </div>
                </div>
            </div>
        </section>
    );
}
