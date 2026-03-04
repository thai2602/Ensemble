import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import morgan from 'morgan';

import connectDB from './utils/db.js';
import { corsOptions } from './config/cors.js';
import { errorHandler } from './utils/errors.js';

// Routes
import postsRouter from './routes/posts.refactored.js';
import productsRouter from './routes/products.js';
import userRoutes from './routes/auth.js';
import postCategories from './routes/postCategoriesRoute.js';
import ProductCategoriesRoute from './routes/productCategoriesRoute.js';
import albumRoutes from './routes/albumsRoute.js';
import shopRoute from './routes/shopRoute.js';

dotenv.config({ path: './.env' });

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in .env');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;

const app = express();

// Middlewares
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions), (req, res) => res.sendStatus(204));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Static files
const uploadDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir));

// Health check
app.get('/health', (_req, res) => res.send('ok'));

// API Routes
app.use('/posts', postsRouter);
app.use('/products', productsRouter);
app.use('/users', userRoutes);
app.use('/categories', postCategories);
app.use('/productCategories', ProductCategoriesRoute);
app.use('/albums', albumRoutes);
app.use('/shop', shopRoute);

// Error handling middleware (phải đặt cuối cùng)
app.use(errorHandler);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
    console.log('CORS extra ENV origins:', process.env.CORS_ORIGINS?.split(',') || []);
  });
});
