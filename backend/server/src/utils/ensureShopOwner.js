import Shop from '../models/shop.js';

/**
 * Kiểm tra user có phải là chủ shop không
 * @param {String} shopId - id của shop
 * @param {String} userId - id user hiện tại (req.user._id)
 * @returns {Promise<Shop>}
 * @throws Error 'SHOP_NOT_FOUND' | 'FORBIDDEN'
 */
export default async function ensureShopOwner(shopId, userId) {
  const shop = await Shop.findById(shopId).select('userId');
  if (!shop) throw new Error('SHOP_NOT_FOUND');
  if (shop.userId.toString() !== userId.toString()) throw new Error('FORBIDDEN');
  return shop;
}