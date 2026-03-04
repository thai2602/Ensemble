const ENV_ORIGINS = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const allowedOrigins = [
  ...ENV_ORIGINS,
  /^https?:\/\/(localhost|127\.0\.0\.1):5173$/,
  /^https?:\/\/.*\.ngrok-free\.app$/,
];

export const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const ok = allowedOrigins.some(o => 
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    return ok ? cb(null, true) : cb(new Error('CORS blocked: ' + origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
};
