import axios from "axios";
import { API_URL } from "../config";

const BASE_URL = import.meta.env.DEV ? "/api" : API_URL;

// Helper to get image URL (use proxy in dev, full URL in prod)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // If already full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if exists
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  
  // In development, use proxy (same origin)
  if (import.meta.env.DEV) {
    return cleanPath;
  }
  
  // In production, use full API URL
  return `${API_URL}${cleanPath}`;
};

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  if (!import.meta.env.DEV) {
    config.headers["ngrok-skip-browser-warning"] = "true";
  }
  const t = localStorage.getItem("token");
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default api;
