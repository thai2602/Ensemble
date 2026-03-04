import api from "./api.js";

export async function createAlbum(shopId, payload) {
  const res = await api.post(`/albums/shop/${shopId}`, payload);
  return res.data;
}

export async function listAlbums(shopId, { page=1, limit=12, q='' } = {}) {
  const params = { page, limit, q };
  if (shopId) params.shopId = shopId;
  const res = await api.get("/albums", { params });
  return res.data;
}

export async function getAlbum(shopId, slug) {
  const res = await api.get(`/albums/shop/${shopId}/${slug}`);
  return res.data;
}

export async function addProducts(albumId, productIds) {
  const res = await api.post(`/albums/${albumId}/items`, { productIds });
  return res.data;
}

export async function reorder(albumId, orderedProductIds) {
  const res = await api.post(`/albums/${albumId}/reorder`, { orderedProductIds });
  return res.data;
}
