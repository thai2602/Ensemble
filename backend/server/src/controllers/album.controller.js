import mongoose from "mongoose";
import slugify from 'slugify';
import Album from '../models/album.js';
import Shop from '../models/shop.js';
import Product from '../models/products.js';
import ensureShopOwner from '../utils/ensureShopOwner.js';

export const createAlbum = async (req, res) => {
  try {
    const { shopId } = req.params;
    const { name, theme, coverImage, description, visibility = 'public' } = req.body;

    await ensureShopOwner(shopId, req.user._id);

    const slug = slugify(name, { lower: true, strict: true });
    const album = await Album.create({
      shopId,
      name,
      slug,
      theme: theme || '',
      coverImage: coverImage || '',
      description: description || '',
      visibility,
      items: [],
      createdBy: req.user._id,
    });

    res.status(201).json(album);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Album slug already exists in this shop.' });
    if (err.message === 'FORBIDDEN') return res.status(403).json({ message: 'Forbidden' });
    if (err.message === 'SHOP_NOT_FOUND') return res.status(404).json({ message: 'Shop not found' });
    res.status(500).json({ message: 'Server error', detail: err.message });
  }
};


export const listAlbums = async (req, res) => {
  try {
    const shopId = req.params.shopId || req.query.shopId || null;
    const pageNum  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
    const q = (req.query.q || "").trim();
    const escapeRegex = (s = "") => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const filter = {};
    if (shopId) {
      if (!mongoose.Types.ObjectId.isValid(shopId)) {
        return res.status(400).json({ message: "Invalid shopId" });
      }
      filter.shopId = new mongoose.Types.ObjectId(shopId);
    }
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

    const [items, total] = await Promise.all([
      Album.find(filter)
        .sort({ updatedAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .select("name slug theme coverImage visibility updatedAt items shopId")
        .populate({ path: "items.product", select: "name price image images slug" })
        .lean(),
      Album.countDocuments(filter),
    ]);

    for (const a of items) {
      a.productCount = Array.isArray(a.items) ? a.items.length : 0;
    }

    res.json({
      items,
      total,
      page: pageNum,
      limit: limitNum,
      hasMore: pageNum * limitNum < total,
    });
  } catch (err) {
    console.error("listAlbums error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAlbumBySlug = async (req, res) => {
  try {
    const { shopId, slug } = req.params;

    if (!slug) {
      return res.status(400).json({ message: "Missing slug" });
    }
    if (!mongoose.Types.ObjectId.isValid(shopId)) {
      return res.status(400).json({ message: "Invalid shopId" });
    }

    const album = await Album.findOne({ shopId, slug })
      .populate({ path: "items.product", select: "name price image images slug" })
      .lean();

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    return res.json(album);
  } catch (e) {
    console.error("getAlbumBySlug error:", e);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAlbumById = async (req, res) => {
  try {
    const { albumId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(albumId)) {
      return res.status(400).json({ message: "Invalid albumId" });
    }

    const album = await Album.findById(albumId)
      .populate({ path: "items.product", select: "name price image images slug" })
      .lean();

    if (!album) return res.status(404).json({ message: "Album not found" });
    res.json(album);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAlbumMeta = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { name, theme, coverImage, description, visibility } = req.body;

    const album = await Album.findById(albumId).select('shopId name slug');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    await ensureShopOwner(album.shopId, req.user._id);

    if (name && name !== album.name) {
      album.name = name;
      album.slug = slugify(name, { lower: true, strict: true });
    }
    if (theme !== undefined) album.theme = theme;
    if (coverImage !== undefined) album.coverImage = coverImage;
    if (description !== undefined) album.description = description;
    if (visibility !== undefined) album.visibility = visibility;

    await album.save();
    res.json(album);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Album slug already exists in this shop.' });
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(err.message)) return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const addProducts = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { productIds = [] } = req.body;

    const album = await Album.findById(albumId).select('shopId items');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    await ensureShopOwner(album.shopId, req.user._id);

    let validIds;
    if ('shopId' in Product.schema.paths) {
      const products = await Product.find({ _id: { $in: productIds }, shopId: album.shopId }).select('_id').lean();
      validIds = products.map(p => p._id.toString());
    } else {
      const shop = await Shop.findById(album.shopId).select('products').lean();
      const set = new Set((shop?.products || []).map(String));
      validIds = productIds.filter(id => set.has(String(id)));
      if (validIds.length !== productIds.length) {
        return res.status(400).json({ message: 'Some products do not belong to this shop' });
      }
    }

    const existing = new Set(album.items.map(i => i.product.toString()));
    const startPos = album.items.length;
    validIds.forEach((id, idx) => {
      if (!existing.has(id)) album.items.push({ product: id, position: startPos + idx });
    });

    await album.save();
    res.json(album);
  } catch (err) {
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(err.message)) return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const removeProduct = async (req, res) => {
  try {
    const { albumId, productId } = req.params;
    const album = await Album.findById(albumId).select('shopId items');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    await ensureShopOwner(album.shopId, req.user._id);

    album.items = album.items.filter(i => i.product.toString() !== productId);
    album.items.forEach((i, idx) => i.position = idx);

    await album.save();
    res.json(album);
  } catch (err) {
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(err.message)) return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const reorderItems = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { orderedProductIds = [] } = req.body;

    const album = await Album.findById(albumId).select('shopId items');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    await ensureShopOwner(album.shopId, req.user._id);

    const byId = new Map(album.items.map(i => [i.product.toString(), i]));
    const newItems = [];
    orderedProductIds.forEach((pid, idx) => {
      const item = byId.get(pid);
      if (item) {
        item.position = idx;
        newItems.push(item);
        byId.delete(pid);
      }
    });
    [...byId.values()].forEach((item, idx) => {
      item.position = newItems.length + idx;
      newItems.push(item);
    });
    album.items = newItems;

    await album.save();
    res.json(album);
  } catch (err) {
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(err.message)) return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const album = await Album.findById(albumId).select('shopId');
    if (!album) return res.status(404).json({ message: 'Album not found' });

    await ensureShopOwner(album.shopId, req.user._id);
    await album.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    if (['FORBIDDEN','SHOP_NOT_FOUND'].includes(err.message)) return res.status(403).json({ message: 'Forbidden' });
    res.status(500).json({ message: 'Server error' });
  }
};
