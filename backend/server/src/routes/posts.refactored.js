import express from 'express';
import multer from 'multer';
import path from 'path';
import postController from '../controllers/post.controller.js';
import { isAuth } from '../middlewares/auth.js';
import { validatePost } from '../validators/post.validator.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Routes - clean và dễ đọc
router.post('/', isAuth, upload.single('image'), validatePost, postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/me', isAuth, postController.getMyPosts);
router.get('/:slug', postController.getPostBySlug);
router.patch('/:id', isAuth, postController.updatePost);
router.delete('/:id', isAuth, postController.deletePost);

export default router;
