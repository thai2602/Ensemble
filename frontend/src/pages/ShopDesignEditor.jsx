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

// Modal for editing Text Content (Hero, Story)
function EditModal({ isOpen, onClose, title, fields, onSave }) {
  const [values, setValues] = useState({});
  const [files, setFiles] = useState({});
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    if (isOpen && fields) {
      const initial = {};
      fields.forEach(f => {
        if (f.type !== 'file') initial[f.key] = f.value;
      });
      setValues(initial);
      setFiles({});
      setPreviews({});
    }
  }, [isOpen, fields]);

  if (!isOpen) return null;

  const handleChange = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  const handleFileChange = (key, e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleSave = () => {
    onSave(values, files);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="space-y-4">
          {fields.map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="w-full border rounded p-2"
                  rows={3}
                  value={values[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                />
              ) : field.type === 'file' ? (
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => handleFileChange(field.key, e)}
                    className="w-full"
                  />
                  {(previews[field.key] || (field.value && typeof field.value === 'string')) && (
                    <img
                      src={previews[field.key] || field.value}
                      alt="Preview"
                      className="mt-2 h-32 w-full object-cover rounded border"
                    />
                  )}
                </div>
              ) : (
                <input
                  className="w-full border rounded p-2"
                  type="text"
                  value={values[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// Modal for editing Shop Info
function EditShopInfoModal({ isOpen, onClose, shop, onSave }) {
  const [form, setForm] = useState({ description: '', address: '', phone: '', email: '' });

  useEffect(() => {
    if (isOpen && shop) {
      setForm({
        description: shop.description || "",
        address: shop.address || (shop.contact?.address || ""),
        phone: shop.phone || (shop.contact?.phone || ""),
        email: shop.email || (shop.contact?.email || "")
      });
    }
  }, [isOpen, shop]);

  if (!isOpen) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    // Construct payload compatible with generic update
    const payload = {
      description: form.description,
      contact: {
        address: form.address,
        phone: form.phone,
        email: form.email
      }
    };
    onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold mb-4">Edit Contact Info</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Start)</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded p-2" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input name="email" value={form.email} onChange={handleChange} className="w-full border rounded p-2" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        </div>
      </div>
    </div>
  );
}

// Suggestion Panel Component
function SuggestionPanel({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Auto-fetch random on open if empty
  useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      handleFetch("");
    }
  }, [isOpen]);

  const handleFetch = async (q) => {
    setLoading(true);
    try {
      const res = await api.post('/api/ai/suggest-styles', { query: q });
      setSuggestions(res.data.suggestions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[70] p-6 overflow-y-auto transform transition-transform animate-slide-left mt-16 border-l border-gray-100">
      <h3 className="text-xl font-bold mb-4 flex justify-between items-center text-gray-800">
        AI Style Suggestions
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </h3>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="e.g. 'Coffee', 'Cyberpunk'..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleFetch(query)}
        />
        <button
          onClick={() => handleFetch(query)}
          className="bg-blue-600 text-white px-3 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? '...' : 'Go'}
        </button>
      </div>

      <div className="space-y-4">
        {loading && <div className="text-center text-gray-500 py-4">Generating ideas...</div>}

        {!loading && suggestions.map(s => (
          <div
            key={s.id}
            className="border rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-blue-400 transition bg-white group"
            onClick={() => onSelect(s)}
          >
            <h4 className="font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              {s.name}
            </h4>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed line-clamp-3">{s.description}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {s.keywords.split(',').slice(0, 3).map(k => (
                <span key={k} className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-600 uppercase tracking-wide">{k.trim()}</span>
              ))}
            </div>
            <div className="mt-3 text-blue-600 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Click to Apply →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopDesignEditor() {
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

  // Design History State
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [saving, setSaving] = useState(false);

  // Suggestion State
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [aiTrigger, setAiTrigger] = useState(null);

  // Manual Editing State
  const [editModal, setEditModal] = useState({ open: false, type: null, fields: [] });
  const [editInfoModal, setEditInfoModal] = useState(false);

  const toAbsUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
    return url;
  };

  // Load Shop & Check Ownership
  useEffect(() => {
    if (!shopId) return;
    let cancel = false;

    const loadData = async () => {
      try {
        setLoadingShop(true);
        // 1. Get Shop
        const res = await api.get(`/shop/id/${shopId}`);
        const shopData = res.data;

        // 2. Check Owner
        const token = localStorage.getItem("token");
        if (!token) {
          navigate(`/shop/${shopId}`); // redirect if not logged in
          return;
        }
        try {
          const userRes = await api.get("/users/profile");
          const user = userRes.data;
          if (!user?._id || shopData.userId?._id !== user._id) {
            alert("You are not the owner of this shop");
            navigate(`/shop/${shopId}`);
            return;
          }
        } catch (e) {
          navigate(`/shop/${shopId}`);
          return;
        }

        if (!cancel) {
          setShop(shopData);
          if (shopData.currentDesignConfig && Object.keys(shopData.currentDesignConfig).length > 0) {
            // Merge with initial config to ensure new fields like storyContent exist
            setDesignConfig(prev => ({ ...prev, ...shopData.currentDesignConfig }));
          }
        }

        // 3. Load Products & Albums
        try {
          const prodRes = await api.get(`/products/shop/${shopId}`);
          if (!cancel) setProducts(prodRes.data || []);

          const albRes = await listAlbums(shopId);
          const items = albRes?.items ?? [];
          if (!cancel) setAlbums(items.map(a => ({ ...a, coverImage: a.coverImage ? toAbsUrl(a.coverImage) : null })));
        } catch (e) {
          console.error(e);
        }

        // 4. Load History
        try {
          const histRes = await api.get(`/shop/id/${shopId}/design/versions`);
          if (!cancel) setHistory(histRes.data);
        } catch (e) {
          console.error(e);
        }

      } catch (err) {
        if (!cancel) {
          setShopError(err?.response?.data?.message || "Load shop failed");
          setShop(null);
        }
      } finally {
        if (!cancel) setLoadingShop(false);
      }
    };

    loadData();
    return () => { cancel = true; };
  }, [shopId, navigate]);

  const loadVersions = async () => {
    try {
      const res = await api.get(`/shop/id/${shopId}/design/versions`);
      setHistory(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveVersion = async () => {
    const name = prompt("Enter a name for this design version:");
    if (!name) return;
    setSaving(true);
    try {
      await api.post(`/shop/id/${shopId}/design/versions`, {
        name,
        config: designConfig
      });
      // Also update current active design
      await api.put(`/shop/id/${shopId}/design/current`, {
        config: designConfig
      });
      alert("Design saved successfully!");
      loadVersions();
    } catch (err) {
      alert("Failed to save design: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleApplyVersion = (version) => {
    if (window.confirm(`Apply version "${version.name}"? Unsaved changes will be lost.`)) {
      setDesignConfig(version.config);
    }
  };

  // ----- MANUAL EDITING HANDLERS -----

  const openHeroEdit = () => {
    setEditModal({
      open: true,
      type: 'hero',
      fields: [
        { key: 'title', label: 'Title', value: designConfig.heroContent.title },
        { key: 'subtitle', label: 'Subtitle', value: designConfig.heroContent.subtitle },
        { key: 'buttonText', label: 'Button Text', value: designConfig.heroContent.buttonText },
        { key: 'backgroundImage', label: 'Background Image', value: designConfig.heroContent.backgroundImage, type: 'file' },
      ]
    });
  };

  const openStoryEdit = () => {
    const content = designConfig.storyContent || INITIAL_CONFIG.storyContent;
    setEditModal({
      open: true,
      type: 'story',
      fields: [
        { key: 'tagline', label: 'Tagline', value: content.tagline },
        { key: 'title', label: 'Headline', value: content.title },
        { key: 'description', label: 'Story Text', value: content.description, type: 'textarea' },
        { key: 'image', label: 'Story Image', value: content.image, type: 'file' },
        // Simplified stats editing for now
        { key: 'stat1Val', label: 'Stat 1 Value', value: content.stats?.[0]?.value },
        { key: 'stat1Label', label: 'Stat 1 Label', value: content.stats?.[0]?.label },
        { key: 'stat2Val', label: 'Stat 2 Value', value: content.stats?.[1]?.value },
        { key: 'stat2Label', label: 'Stat 2 Label', value: content.stats?.[1]?.label },
      ]
    });
  };

  const saveEditModal = async (values, files) => {
    let imageUrl = null;
    let heroBgUrl = null;

    if (files?.image) {
      const formData = new FormData();
      formData.append('image', files.image);
      try {
        const res = await api.post(`/shop/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        imageUrl = res.data.url;
      } catch (e) {
        console.error("Upload failed", e);
        alert("Image upload failed. Please try again.");
        return;
      }
    }

    if (files?.backgroundImage) {
      const formData = new FormData();
      formData.append('image', files.backgroundImage);
      try {
        const res = await api.post(`/shop/upload`, formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        heroBgUrl = res.data.url;
      } catch (e) {
        console.error("Upload failed", e);
        alert("Background image upload failed. Please try again.");
        return;
      }
    }

    if (editModal.type === 'hero') {
      setDesignConfig(prev => ({
        ...prev,
        heroContent: {
          ...prev.heroContent,
          ...values,
          backgroundImage: heroBgUrl ? toAbsUrl(heroBgUrl) : (values.backgroundImage || prev.heroContent.backgroundImage)
        }
      }));
    } else if (editModal.type === 'story') {
      const newStats = [
        { value: values.stat1Val, label: values.stat1Label },
        { value: values.stat2Val, label: values.stat2Label }
      ];
      setDesignConfig(prev => ({
        ...prev,
        storyContent: {
          tagline: values.tagline,
          title: values.title,
          description: values.description,
          image: imageUrl ? toAbsUrl(imageUrl) : (values.image || prev.storyContent.image),
          stats: newStats
        }
      }));
    }
    setEditModal({ open: false, type: null, fields: [] });
  };

  const saveShopInfo = async (payload) => {
    try {
      const res = await api.patch(`/shop/id/${shopId}`, payload);
      setShop(res.data); // Update local shop state
      setEditInfoModal(false);
    } catch (err) {
      alert("Failed to update shop info");
    }
  };

  // Handle Suggestion Selection
  const handleSuggestionSelect = (suggestion) => {
    // Trigger ChatBot with the suggestion description
    setAiTrigger(`Design the shop with this style: ${suggestion.name}. ${suggestion.description}`);
    setShowSuggestions(false); // Close panel
  };

  // Derived Styles
  const themeStyles = {
    palette: designConfig.colorPalette,
    borderStyles: { rounded: "rounded-lg", shadowHard: "shadow-xl" }
  };

  // Pass active story content to components
  const componentData = {
    shop,
    products,
    albums,
    storyContent: designConfig.storyContent || INITIAL_CONFIG.storyContent
  };

  // Delete a version
  const handleDeleteVersion = async (e, versionId) => {
    e.stopPropagation(); // Prevent triggering handleApplyVersion
    if (!window.confirm("Are you sure you want to delete this version?")) return;

    try {
      await api.delete(`/shop/id/${shopId}/design/versions/${versionId}`);
      // Optimistically remove from state
      setHistory(prev => prev.filter(v => v._id !== versionId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete version");
    }
  };

  if (loadingShop) return <div className="p-6 text-gray-600">Loading editor...</div>;
  if (shopError) return <div className="p-6 text-red-600">{shopError}</div>;
  if (!shop) return <div className="p-6 text-gray-600">Shop not found.</div>;

  return (
    <>
      <EditModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ ...editModal, open: false })}
        title={editModal.type === 'hero' ? "Edit Hero Section" : "Edit Story Section"}
        fields={editModal.fields}
        onSave={saveEditModal}
      />

      <EditShopInfoModal
        isOpen={editInfoModal}
        onClose={() => setEditInfoModal(false)}
        shop={shop}
        onSave={saveShopInfo}
      />

      {/* Editor Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-gray-900 text-white z-[60] flex items-center px-6 justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/shop/${shopId}`)} className="text-gray-300 hover:text-white flex items-center gap-1">
            ← Back to Shop
          </button>
          <h1 className="text-lg font-bold border-l border-gray-700 pl-4">Design Editor</h1>
        </div>

        {/* Helper Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full text-xs font-bold shadow-lg hover:shadow-purple-500/50 transition flex items-center gap-2"
          >
            <span>✨ AI Ideas</span>
          </button>
          <div className="text-sm text-gray-400 border-l border-gray-700 pl-3">
            Editing: {shop.name}
          </div>
        </div>
      </div>

      {/* Main Content pushed down */}
      <div className="mt-16 relative">
        {/* Edit Controls */}
        <div className="fixed bottom-8 left-8 z-50 flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="bg-white text-gray-800 p-3 rounded-full shadow-lg hover:bg-gray-100 transition border border-gray-200"
            title="Design History"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          <button
            onClick={handleSaveVersion}
            disabled={saving}
            className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition"
            title="Save & Publish"
          >
            {saving ? (
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full block"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
          </button>
        </div>

        {/* AI ChatBot (Always visible in editor) */}
        <ChatBot
          onUpdateDesign={(newConfig) => setDesignConfig(prev => ({ ...prev, ...newConfig }))}
          externalMessage={aiTrigger}
        />

        {/* Note: Reset trigger after sending to prevent loops (done in ChatBot slightly or we just ignore duplicate, 
           but simpler is that ChatBot effect handles changes. 
           Ideally we'd clear it here, but `externalMessage` prop pattern works if we assume unique strings or just change it.
           For re-triggering same one, we might need a timestamp/ID, but for now unique text or re-click is fine.
        */}

        {/* Suggestion Panel */}
        <SuggestionPanel
          isOpen={showSuggestions}
          onClose={() => setShowSuggestions(false)}
          onSelect={handleSuggestionSelect}
        />

        {/* History Drawer */}
        {showHistory && (
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-2xl z-[70] p-6 overflow-y-auto transform transition-transform animate-slide-right mt-16">
            <h3 className="text-xl font-bold mb-4 flex justify-between items-center">
              Versions
              <button onClick={() => setShowHistory(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </h3>
            <div className="space-y-3">
              {history.length === 0 && <p className="text-gray-500 italic">No saved versions yet.</p>}
              {[...history].reverse().map(ver => (
                <div key={ver._id} className="border p-3 rounded-lg hover:bg-gray-50 cursor-pointer group relative" onClick={() => handleApplyVersion(ver)}>
                  <div className="font-semibold text-gray-800 pr-6">{ver.name}</div>
                  <div className="text-xs text-gray-500">{new Date(ver.createdAt).toLocaleString()}</div>
                  <div className="mt-2 flex gap-1">
                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ background: ver.config?.colorPalette?.primary }}></span>
                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ background: ver.config?.colorPalette?.secondary }}></span>
                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ background: ver.config?.colorPalette?.background }}></span>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => handleDeleteVersion(e, ver._id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition"
                    title="Delete Version"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 
            PREVIEW AREA 
            (Same layout as live site, but inside the editor wrapper)
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
          <header className={`relative group w-full overflow-hidden ${designConfig.layoutMode === 'split_screen' ? 'flex flex-col md:flex-row h-auto' : 'h-[500px]'}`}>
            {/* Manual Edit Button for Hero */}
            <button
              onClick={openHeroEdit}
              className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white text-blue-600"
              title="Edit Hero Text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>

            {/* Background / Image Area */}
            <div className={`absolute inset-0 z-0 ${designConfig.layoutMode === 'split_screen' ? 'relative order-2 md:w-1/2 h-[400px] md:h-auto' : ''}`}>
              <img
                src={designConfig.heroContent.backgroundImage || (shop.avatar ? toAbsUrl(shop.avatar) : defaultBg)}
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

              // Determine if this section needs an edit button
              let editBtn = null;
              if (sectionKey === 'story') {
                editBtn = (
                  <button
                    onClick={openStoryEdit}
                    className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white text-blue-600"
                    title="Edit Story Text"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                );
              } else if (sectionKey === 'contact') {
                editBtn = (
                  <button
                    onClick={() => setEditInfoModal(true)}
                    className="absolute top-4 right-4 z-20 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition hover:bg-white text-blue-600"
                    title="Edit Contact Info"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                );
              }

              return (
                <div key={sectionKey} className="animate-fade-in-up relative group">
                  {editBtn}
                  <Component
                    data={componentData}
                    themeStyles={themeStyles}
                  />
                </div>
              );
            })}
          </main>
        </div>
      </div>
    </>
  );
}
