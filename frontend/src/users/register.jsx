import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import { useToast } from "../components/ToastProvider";

export default function Register() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.username.trim() || !form.email.trim() || !form.password) {
      return addToast("Please fill in all information", "error");
    }
    if (form.password.length < 6) {
      return addToast("Password must be >= 6 characters", "error");
    }
    if (form.password !== form.confirmPassword) {
      return addToast("Confirm password does not match", "error");
    }

    setLoading(true);
    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password
      };
      await api.post("/users/register", payload);
      addToast("Registration successful! Please login.", "success");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Join our community of creators</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                name="username"
                value={form.username} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="johndoe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email} onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 mt-2"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-black hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
