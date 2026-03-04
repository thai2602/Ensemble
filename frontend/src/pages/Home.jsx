import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api, { getImageUrl } from "../lib/api";
import defaultBG from "../assets/backrough-default.jpg";
import defaultImg from "../assets/default-img.jpg";

const SkeletonCard = () => (
  <div className="min-w-[280px] w-full border border-gray-100 rounded-2xl p-4 animate-pulse">
    <div className="h-48 bg-gray-200 rounded-xl mb-4"></div>
    <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
  </div>
);

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const productRef = useRef(null);
  const postRef = useRef(null);

  const parseArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
  };

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        setLoading(true);
        const [postRes, productRes] = await Promise.all([
          api.get("/posts", { signal: controller.signal }),
          api.get("/products", { signal: controller.signal }),
        ]);

        if (!cancelled) {
          setPosts(parseArray(postRes?.data));
          setProducts(parseArray(productRes?.data));
        }
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error("Error when load data:", err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const scrollLeft = (ref) => ref.current?.scrollBy({ left: -320, behavior: "smooth" });
  const scrollRight = (ref) => ref.current?.scrollBy({ left: 320, behavior: "smooth" });

  return (
    <div id="home-page" className="bg-gray-50 text-gray-900 min-h-screen font-sans selection:bg-blue-100">

      {/* HERO SECTION */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0">
          <img
            src={defaultBG}
            alt="Hero Background"
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30" />
        </div>

        {/* Content Layer */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in-up">

          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6 drop-shadow-xl">
            <span className="text-white">BlogShop</span>
          </h1>

          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
            A uniform platform for creative minds. <br className="hidden md:block" />
            Sell products, tell stories, and build your digital store.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/shop"
              className="bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg hover:shadow-white/20 hover:-translate-y-1"
            >
              Start Exploring
            </Link>
            <Link
              to="/shop/create"
              className="bg-white/10 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition hover:-translate-y-1"
            >
              Create Your Shop
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES - BENTO GRID */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 mb-4">
              Everything You Need
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto text-lg">
              Powerful tools designed for specific creator needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
            {/* Large Item */}
            <Link to="/shop" className="md:col-span-2 md:row-span-1 group relative rounded-3xl p-10 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between hover:border-blue-200">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity group-hover:scale-110 duration-500">
                <svg className="w-64 h-64 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div className="relative z-10 p-2 bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-3">Global Marketplace</h3>
                <p className="text-gray-500 text-lg max-w-md">Discover unique handcrafted items and digital goods from creators worldwide.</p>
              </div>
            </Link>

            {/* Tall Item */}
            <Link to="/blog" className="md:col-span-1 md:row-span-2 group relative rounded-3xl p-10 bg-gray-900 text-white shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black rounded-3xl"></div>
              <div className="relative z-10 flex-1 flex flex-col">
                <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-auto backdrop-blur-sm">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </div>
                <div>
                  <h3 className="text-3xl font-bold mb-4">Start Writing</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">Share your journey, write tutorials, or document your process. Your voice matters here.</p>
                  <span className="inline-flex items-center text-emerald-400 font-bold group-hover:gap-2 transition-all">Read Stories →</span>
                </div>
              </div>
            </Link>

            {/* Regular Item */}
            <Link to="/albums" className="group rounded-3xl p-8 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-purple-200">
              <div className="bg-purple-100 w-14 h-14 rounded-2xl flex items-center justify-center text-purple-600 mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Albums</h3>
              <p className="text-gray-500">Curate visual collections of your best work.</p>
            </Link>

            {/* Regular Item */}
            <Link to="/contact" className="group rounded-3xl p-8 bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-orange-200">
              <div className="bg-orange-100 w-14 h-14 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Connect</h3>
              <p className="text-gray-500">Support, partnerships, and community.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* TRENDING PRODUCTS */}
      <section className="py-20 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Trending Products</h2>
            <p className="text-gray-500 mt-2">Handpicked items you'll love</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => scrollLeft(productRef)} className="p-3 rounded-full bg-gray-50 border hover:bg-gray-200 transition">←</button>
            <button onClick={() => scrollRight(productRef)} className="p-3 rounded-full bg-gray-50 border hover:bg-gray-200 transition">→</button>
          </div>
        </div>

        <div className="max-w-[1920px] mx-auto px-6">
          <div ref={productRef} className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide scroll-smooth snap-x">
            {loading
              ? Array(5).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : products.map((p, idx) => (
                <div key={idx} className="min-w-[280px] w-[280px] bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden border border-gray-100 snap-start">
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={getImageUrl(p.image) || defaultImg}
                      onError={(e) => e.target.src = defaultImg}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={p.name}
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                      {typeof p?.price === "number" ? p.price.toLocaleString("vi-VN") + " ₫" : "Contact"}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1 truncate">{p.name || "Untitled Product"}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{p.description || "No description available."}</p>
                    <Link to={`/product/${p.slug || p._id}`} className="block w-full text-center py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-black transition">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            {products.length === 0 && !loading && <div className="p-6 text-gray-500">No products found.</div>}
          </div>
        </div>
      </section>

      {/* TRUST & VALUE PROPOSITION */}
      <section className="py-20 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { title: 'Fast Delivery', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { title: 'Secure Payment', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
              { title: '24/7 Support', icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z' },
              { title: 'Creator Community', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-gray-700">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h4 className="font-bold text-gray-900">{item.title}</h4>
                <p className="text-gray-500 text-sm mt-1">Verified & Trusted</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LATEST STORIES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Latest from the Blog</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array(3).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : posts.slice(0, 3).map((post, idx) => (
                <Link key={idx} to={`/blog/${post.slug || post._id}`} className="group block h-full">
                  <div className="rounded-2xl overflow-hidden mb-6 relative aspect-[4/3] shadow-sm">
                    <img
                      src={getImageUrl(post.image) || defaultImg}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      alt={post.title}
                      onError={(e) => e.target.src = defaultImg}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
                    {post.title || "Untitled Story"}
                  </h3>
                  <p className="text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                    {post.summary || "Click to read the full story..."}
                  </p>
                  <span className="text-blue-600 font-semibold text-sm underline decoration-2 decoration-transparent group-hover:decoration-blue-600 transition-all">
                    Read Full Story
                  </span>
                </Link>
              ))}
          </div>
          {posts.length === 0 && !loading && <p className="text-center text-gray-500">No stories published yet.</p>}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="bg-gray-900 text-white py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">Start Your Digital Journey</h2>
          <p className="text-xl text-gray-400 mb-10 font-light">
            Join a community of creators and build something amazing today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/shop/create" className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-lg hover:bg-gray-100 transition">
              Create Shop
            </Link>
            <Link to="/contact" className="px-8 py-4 border border-gray-700 rounded-full font-bold text-lg hover:bg-gray-800 transition text-gray-300">
              Contact Support
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER SECTION */}
      <section className="py-20 bg-gray-50 border-t border-gray-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscribe to our Newsletter</h2>
          <p className="text-gray-500 mb-8">Get the latest updates, stories, and product drops tailored for you.</p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg">
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
