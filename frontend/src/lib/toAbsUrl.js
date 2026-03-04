import { API_URL } from "../config";

export default function toAbsUrl(url) {
  if (!url) return "";
  try {
    let u = String(url).trim();

    u = u.replace(/\\/g, "/");

    if (u.startsWith("/uploads/")) {
      return `${API_URL.replace(/\/+$/, "")}${u}`;
    }

    if (/^https?:\/\//i.test(u)) {
      return new URL(u).href;
    }

    return "";
  } catch {
    return "";
  }
}
