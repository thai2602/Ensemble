import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listAlbums } from "../lib/albumsApi.js";
import api from "../lib/api";
import { API_URL } from "../config/index";
import { THEMES } from "../config/themeLibrary";
import { COMPONENT_MAP } from "../components/dynamic/componentLibrary";
import ChatBot from "../components/ChatBot/ChatBot";
import defaultBg from "../assets/backrough-default.jpg";

// Map simple section names to component keys
const SECTION_MAPPING = {
  products: "product_grid",
  story: "story_section",
  album: "gallery_grid",
  contact: "shop_info_card"
};

// Initial Configuration (Default)
const INITIAL_CONFIG = {
  // Default Palette (Ocean Blue equivalent)
  colorPalette: {
    primary: "#2563eb",   // blue-600
    secondary: "#dbeafe", // blue-100
    background: "#eff6ff",// blue-50
    text: "#1e3a8a",      // blue-900
    accent: "#1d4ed8"     // blue-700
  },
  layoutMode: "standard",
  heroContent: {
    title: "Crafted with Passion",
    subtitle: "Served with Love",
    buttonText: "Shop Now"
  },
  // Story Content (Default)
  storyContent: {
    tagline: "Our Story",
    title: "Tradition Meets Modern Taste",
    description: "We started with a simple mission: to bring the authentic flavors of quality ingredients to your table. Every product is crafted with care.",
    image: "https://images.unsplash.com/photo-1442512595331-e89e7385a861?w=800",
    stats: [{ value: "10+", label: "Years of Service" }, { value: "5k+", label: "Happy Customers" }]
  },
  activeSections: ["contact", "products", "story", "album"]
};

export default function ShopHomePage() {
  const navigate = useNavigate();
  const { shopId } = useParams();

  // Data State
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loadingShop, setLoadingShop] = useState(true);
  const [shopError, setShopError] = useState("");

  // Design Config State
  const [designConfig, setDesignConfig] = useState(INITIAL_CONFIG);

  const toAbsUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return url;
  };

  // Fetch Data (Keeping existing logic)
  useEffect(() => {
    if (!shopId) return;
    let cancel = false;
    (async () => {
      try {
        setLoadingShop(true);
        setShopError("");
        const res = await api.get(`/shop/id/${shopId}`);
        if (!cancel) {
          setShop(res.data);
          if (res.data.currentDesignConfig && Object.keys(res.data.currentDesignConfig).length > 0) {
            setDesignConfig(prev => ({ ...prev, ...res.data.currentDesignConfig }));
          }
        }
      } catch (err) {
        if (!cancel) {
          setShopError(err?.response?.data?.message || "Load shop failed");
          setShop(null);
        }
      } finally {
        if (!cancel) setLoadingShop(false);
      }
    })();
    return () => { cancel = true; };
  }, [shopId]);

  useEffect(() => {
    if (!shopId) return;
    api.get(`/products/shop/${shopId}`)
      .then(res => setProducts(res.data || []))
      .catch(console.error);
    listAlbums(shopId)
      .then(data => {
        const items = data?.items ?? [];
        setAlbums(items.map(a => ({ ...a, coverImage: a.coverImage ? toAbsUrl(a.coverImage) : null })));
      })
      .catch(console.error);
  }, [shopId]);

  const [isOwner, setIsOwner] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    if (!shop) return;
    const checkOwner = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsOwner(false);
          return;
        }
        const res = await api.get("/users/profile");
        const user = res.data;
        if (user?._id && shop.userId?._id === user._id) {
          setIsOwner(true);
          // Load versions if owner
          api.get(`/shop/id/${shopId}/design/versions`)
            .then(vRes => setVersions(vRes.data))
            .catch(err => console.error("Failed to load versions", err));
        } else {
          setIsOwner(false);
        }
      } catch (err) {
        setIsOwner(false);
      }
    };
    checkOwner();
  }, [shop, shopId]);

  const handleApplyVersion = async (version) => {
    if (window.confirm(`Apply version "${version.name}" to your live shop?`)) {
      try {
        // Update backend
        await api.put(`/shop/id/${shopId}/design/current`, {
          config: version.config
        });
        // Update local state
        setDesignConfig(version.config);
        setShowVersions(false);
        alert("Design updated successfully!");
      } catch (err) {
        alert("Failed to apply version");
        console.error(err);
      }
    }
  };

  // Derived Styles
  const themeStyles = {
    palette: designConfig.colorPalette,
    borderStyles: { rounded: "rounded-lg", shadowHard: "shadow-xl" }
  };

  const componentData = {
    shop,
    products,
    albums,
    storyContent: designConfig.storyContent || INITIAL_CONFIG.storyContent
  };

  if (loadingShop) return <div className="p-6 text-gray-600">Loading shop...</div>;
  if (shopError) return <div className="p-6 text-red-600">{shopError}</div>;
  if (!shop) return <div className="p-6 text-gray-600">Shop not found.</div>;

  return (
    <>
      {/* Edit Trigger for Owner */}
      {isOwner && (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 items-end">
          {/* Versions Button */}
          <div className="relative group">
            <button
              onClick={() => setShowVersions(!showVersions)}
              className="bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg font-bold hover:bg-gray-100 transition flex items-center gap-2 border border-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              Versions
            </button>

            {/* Versions Dropdown/Modal */}
            {showVersions && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl shadow-2xl p-4 border border-gray-100 max-h-80 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Saved Designs</h3>
                <div className="space-y-2">
                  {versions.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No saved versions found.</p>
                  ) : (
                    [...versions].reverse().map(ver => (
                      <div
                        key={ver._id}
                        onClick={() => handleApplyVersion(ver)}
                        className="p-3 rounded-lg hover:bg-blue-50 cursor-pointer border border-transparent hover:border-blue-100 transition group/item"
                      >
                        <div className="font-semibold text-gray-800 text-sm group-hover/item:text-blue-700">{ver.name}</div>
                        <div className="text-[10px] text-gray-400">{new Date(ver.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Edit Button */}
          <button
            onClick={() => navigate(`/shop/${shopId}/design`)}
            className="bg-black text-white px-6 py-3 rounded-full shadow-xl font-bold hover:scale-105 transition flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Design
          </button>
        </div>
      )}

      {/*
         THEME POOL
         Injecting dynamic colors as CSS variables.
      */}
      <div
        className="min-h-screen transition-colors duration-500 font-sans"
        style={{
          "--theme-primary": designConfig.colorPalette?.primary || INITIAL_CONFIG.colorPalette.primary,
          "--theme-secondary": designConfig.colorPalette?.secondary || INITIAL_CONFIG.colorPalette.secondary,
          "--theme-background": designConfig.colorPalette?.background || INITIAL_CONFIG.colorPalette.background,
          "--theme-text": designConfig.colorPalette?.text || INITIAL_CONFIG.colorPalette.text,
          "--theme-accent": designConfig.colorPalette?.accent || INITIAL_CONFIG.colorPalette.accent,
          backgroundColor: "var(--theme-background)",
          color: "var(--theme-text)"
        }}
      >
        {/* Dynamic Header / Hero */}
        <header className={`relative w-full overflow-hidden ${designConfig.layoutMode === 'split_screen' ? 'flex flex-col md:flex-row h-auto' : 'h-[500px]'}`}>
          {/* Background / Image Area */}
          <div className={`absolute inset-0 z-0 ${designConfig.layoutMode === 'split_screen' ? 'relative order-2 md:w-1/2 h-[400px] md:h-auto' : ''}`}>
            <img
              src={shop.avatar ? toAbsUrl(shop.avatar) : defaultBg}
              className="w-full h-full object-cover"
              onError={(e) => e.currentTarget.src = defaultBg}
              alt="Hero"
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>

          {/* Content Area */}
          <div className={`relative z-10 flex flex-col justify-center px-6 ${designConfig.layoutMode === 'split_screen'
            ? 'order-1 md:w-1/2 py-20 bg-opacity-0 text-[var(--theme-text)]'
            : 'h-full text-center text-white items-center'
            }`}>
            <h1 className={`text-5xl md:text-7xl font-bold mb-4 leading-tight ${designConfig.layoutMode === 'split_screen' ? 'text-[var(--theme-primary)]' : 'text-white'}`}>
              {designConfig.heroContent.title}
            </h1>
            <p className={`text-xl md:text-2xl mb-8 opacity-90 max-w-2xl ${designConfig.layoutMode !== 'split_screen' ? 'text-gray-200' : ''}`}>
              {designConfig.heroContent.subtitle}
            </p>
            <button
              className="px-8 py-4 rounded-full font-bold text-lg transition shadow-lg hover:brightness-110"
              style={{
                backgroundColor: "var(--theme-primary)",
                color: "#ffffff"
              }}
            >
              {designConfig.heroContent.buttonText}
            </button>
          </div>
        </header>

        {/* Dynamic Sections */}
        <main className="py-12 space-y-20">
          {designConfig.activeSections.map((sectionKey) => {
            const componentKey = SECTION_MAPPING[sectionKey];
            const Component = COMPONENT_MAP[componentKey];

            if (!Component) return null;

            return (
              <div key={sectionKey} className="animate-fade-in-up">
                <Component
                  data={componentData}
                  themeStyles={themeStyles}
                />
              </div>
            );
          })}
        </main>
      </div>
    </>
  );
}
