import api from "../lib/api";

export async function fetchAndSaveShop() {
  try {
    const res = await api.get("/shop/me");
    const shop = res.data;
    if (shop?._id) {
      localStorage.setItem("shopId", shop._id);
      console.log("Đã lưu shopId:", shop._id);
    }
  } catch (err) {
    console.error("Lỗi khi lấy shop:", err.response?.data || err.message);
  }
}
