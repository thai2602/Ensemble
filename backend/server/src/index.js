import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";

import connectDB from "./utils/db.js";

import postsRouter from "./routes/posts.js";
import productsRouter from "./routes/products.js";
import userRoutes from "./routes/auth.js";
import postCategories from "./routes/postCategoriesRoute.js";
import ProductCategoriesRoute from "./routes/productCategoriesRoute.js";
import albumRoutes from "./routes/albumsRoute.js";
import shopRoute from "./routes/shopRoute.js";
import commentsRouter from "./routes/comments.js";
import aiDesignRoutes from "./routes/aiDesignRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });
if (!process.env.JWT_SECRET) {
  console.error("Missing JWT_SECRET in .env");
  process.exit(1);
}

const PORT = process.env.PORT || 5000;

const ENV_ORIGINS = (process.env.CORS_ORIGINS || "")
  .split(",").map(s => s.trim()).filter(Boolean);

const allowedOrigins = [
  ...ENV_ORIGINS,
  /^https?:\/\/(localhost|127\.0\.0\.1):5173$/,
  /^https?:\/\/.*\.ngrok-free\.app$/,
];

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o => o instanceof RegExp ? o.test(origin) : o === origin);
    return ok ? cb(null, true) : cb(new Error("CORS blocked: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "ngrok-skip-browser-warning"],
};

const app = express();
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions), (req, res) => res.sendStatus(204));

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

const uploadDir = path.resolve(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

app.get("/health", (_req, res) => res.send("ok"));

// Routers
app.use("/posts", postsRouter);
app.use("/products", productsRouter);
app.use("/users", userRoutes);
app.use("/categories", postCategories);
app.use("/productCategories", ProductCategoriesRoute);
app.use("/albums", albumRoutes);
app.use("/shop", shopRoute);
app.use("/comments", commentsRouter);
app.use("/api/ai", aiDesignRoutes);


app.use((err, req, res, next) => {
  if (err && String(err.message || "").startsWith("CORS")) {
    return res.status(403).json({ message: err.message });
  }
  next(err);
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server listening at http://localhost:${PORT}`);
    console.log("CORS extra ENV origins:", ENV_ORIGINS);
  });
});
