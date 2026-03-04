import express from "express";
import {
  createAlbum,
  listAlbums,
  getAlbumBySlug,
  getAlbumById,
  updateAlbumMeta,
  addProducts,
  reorderItems,
  removeProduct,
  deleteAlbum,
} from "../controllers/album.controller.js";
import { isAuth } from "../middlewares/auth.js";

const router = express.Router();

/**
 * PUBLIC
 * - GET /api/albums                 
 * - GET /api/albums/shop/:shopId     
 * - GET /api/albums/shop/:shopId/:slug 
 */
router.get("/", listAlbums);
router.get("/shop/:shopId/:slug", getAlbumBySlug);
router.get("/shop/:shopId", listAlbums);
router.get("/:albumId", getAlbumById);

/**
 * PRIVATE 
 * - POST   /api/albums/shop/:shopId         
 * - PATCH  /api/albums/:albumId             
 * - POST   /api/albums/:albumId/items       
 * - POST   /api/albums/:albumId/reorder    
 * - DELETE /api/albums/:albumId/items/:productId 
 * - DELETE /api/albums/:albumId             
 */
router.post("/shop/:shopId", isAuth, createAlbum);
router.patch("/:albumId", isAuth, updateAlbumMeta);
router.post("/:albumId/items", isAuth, addProducts);
router.post("/:albumId/reorder", isAuth, reorderItems);
router.delete("/:albumId/items/:productId", isAuth, removeProduct);
router.delete("/:albumId", isAuth, deleteAlbum);

export default router;
