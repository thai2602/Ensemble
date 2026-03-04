import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getImageUrl } from "../lib/api";
import { useToast } from "../components/ToastProvider";

export default function CreateShop() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    avatar: "",
    images: [],
    description: "",
    contact: {
      phone: "",
      email: "",
      facebook: "",
      address: "",
    },
  });

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) {
      navigate("/login");
      return;
    }

    // Check if user already has a shop
    const checkShop = async () => {
      try {
        const res = await api.get("/shop/me");
        if (res.data && res.data._id) {
          addToast("You already have a shop", "info");
          navigate(`/shop/${res.data._id}`);
        }
      } catch (e) {
        // If 404, it means no shop => user can create one.
        // If other error, just log or ignore
      }
    };
    checkShop();
  }, [navigate, addToast]);

  const onChange = (e) => {
    const { name, value } = e.target;
    // contact.*
    if (name.startsWith("contact.")) {
      const key = name.split(".")[1];
      setForm((prev) => ({ ...prev, contact: { ...prev.contact, [key]: value } }));
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await api.post("/shop/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data.url;
    } catch (err) {
      console.error(err);
      addToast("Upload failed", "error");
      return null;
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await handleUpload(file);
    setUploading(false);
    if (url) {
      setForm((prev) => ({ ...prev, avatar: url }));
    }
  };

  const handleAlbumChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const url = await handleUpload(file);
      if (url) urls.push(url);
    }
    setUploading(false);
    if (urls.length > 0) {
      setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }));
    }
  };

  const removeImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const validate = () => {
    if (!form.name.trim()) {
      addToast("Shop name is required", "error");
      return false;
    }
    if (form.contact.email && !/^\S+@\S+\.\S+$/.test(form.contact.email)) {
      addToast("Invalid email", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      addToast("You need to log in first", "error");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        avatar: form.avatar.trim(),
        images: (form.images || []).map(s => s.trim()).filter(Boolean),
        description: form.description.trim(),
        contact: {
          phone: form.contact.phone.trim(),
          email: form.contact.email.trim(),
          facebook: form.contact.facebook.trim(),
          address: form.contact.address.trim(),
        },
      };

      const res = await api.post("/shop", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      addToast("Create shop successfully!", "success");
      const created = res.data;
      if (created._id) {
        localStorage.setItem("shopId", created._id);
        // Also update local check if needed, but navigation will happen
      }
      navigate(`/shop/${created._id}`);
      return;
    } catch (err) {
      if (err.response?.status === 409) {
        const shopId = err.response.data?.shopId;
        if (shopId) {
          addToast("You already have a shop, go to the shop page.", "info");
          navigate(`/shop/${shopId}`);
          return;
        }
        try {
          const me = await api.get("/shop/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          navigate(`/shop/${me.data._id}`);
          return;
        } catch (e2) {
          const msg = e2.response?.data?.message || "Cannot get existing shop";
          addToast(msg, "error");
        }
      } else {
        const msg = err.response?.data?.message || "Cannot create shop";
        addToast(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-6">Create Shop</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên shop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop name *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Ex: Cake Bakery"
              className="w-full border rounded-md p-2"
              required
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
            <div className="flex gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={uploading}
                className="flex-1 border rounded-md p-2"
              />
              {form.avatar ? (
                <img
                  src={getImageUrl(form.avatar)}
                  alt="avatar"
                  className="w-14 h-14 rounded-full object-cover border"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ) : null}
            </div>
            {uploading && <p className="text-xs text-blue-500 mt-1">Uploading...</p>}
          </div>

          {/* Images list (Album) */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Album Pictures</label>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAlbumChange}
                disabled={uploading}
                className="flex-1 border rounded-md p-2"
              />
            </div>
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={getImageUrl(url)}
                      alt={`img-${idx}`}
                      className="w-full h-28 object-cover rounded border"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Xoá
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div> */}

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={onChange}
              placeholder="Brief introduction about the shop..."
              className="w-full border rounded-md p-2"
              rows={4}
            />
          </div>

          {/* Contact */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
              <input
                name="contact.phone"
                value={form.contact.phone}
                onChange={onChange}
                placeholder="090..."
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="contact.email"
                value={form.contact.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="w-full border rounded-md p-2"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
              <input
                name="contact.facebook"
                value={form.contact.facebook}
                onChange={onChange}
                placeholder="https://facebook.com/yourpage"
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input
                name="contact.address"
                value={form.contact.address}
                onChange={onChange}
                placeholder="House number, street, district, province/city"
                className="w-full border rounded-md p-2"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-5 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-60"
            >
              {loading ? "Creating..." : (uploading ? "Uploading..." : "Create shop")}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
