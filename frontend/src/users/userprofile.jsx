import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { API_URL } from "../config";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const run = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const res = await api.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!ignore) setUser(res.data);
      } catch (err) {
        const status = err.response?.status;
        if (status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    run();
    return () => { ignore = true; };
  }, [navigate]);

  if (loading) return <div className="p-6">Loading...</div>;

  const avatarSrc = user?.avatar
    ? (user.avatar.startsWith('/uploads/')
      ? `${API_URL}${user.avatar}`
      : user.avatar)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || "User")}`;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-[280px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Settings</h2>
              </div>
              <nav className="p-2">
                <button className="w-full text-left px-4 py-3 rounded-lg bg-gray-100 font-semibold text-gray-900 transition">
                  Profile
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  Account
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  Privacy
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition">
                  Notifications
                </button>
              </nav>
              <div className="p-2 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="space-y-6">
            {/* Profile Picture */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <img
                  src={avatarSrc}
                  alt="Profile"
                  className="w-24 h-24 rounded-full border-4 border-gray-200 object-cover"
                />
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium">
                    Change Picture
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.username || ""}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition"
                    placeholder="Enter your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email || ""}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-2">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.username || ""}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-2">Username can be changed after 25/04/2024</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    defaultValue={user?.about || ""}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition resize-none"
                    placeholder="Tell us about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-2">Brief description for your profile</p>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium">
                  Cancel
                </button>
                <button className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition font-medium">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Account Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600 mt-1">Posts</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600 mt-1">Products</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600 mt-1">Followers</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600 mt-1">Following</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
