// src/server.ts
// Express application entry point

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import router from './routes/index';

const app = express();
const PORT = process.env.PORT || 3001;

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS — allow localhost AND the machine's network IP (set via FRONTEND_URL) ─
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // start.cjs injects the machine's LAN IP here at launch time
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true, // required for httpOnly cookie
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Logging ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Global rate limiting ──────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { error: { code: 'RATE_LIMIT', message: 'Too many requests, please try again later' } },
});
app.use('/api', globalLimiter);

// ── Auth-specific rate limiting (stricter) ────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 login attempts per 15 minutes per IP
  message: { error: { code: 'RATE_LIMIT', message: 'Too many login attempts, please wait 15 minutes' } },
});
app.use('/api/auth/login', authLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', router);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[UNHANDLED ERROR]', err.message);

  // Prisma unique constraint
  if ((err as any).code === 'P2002') {
    return res.status(409).json({ error: { code: 'CONFLICT', message: 'A record with this value already exists' } });
  }
  // Prisma not found
  if ((err as any).code === 'P2025') {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Record not found' } });
  }
  // Multer file size error
  if ((err as any).code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: { code: 'FILE_TOO_LARGE', message: `File exceeds the ${process.env.MAX_FILE_SIZE_MB || 20}MB limit` } });
  }
  if (err.message?.includes('not allowed')) {
    return res.status(400).json({ error: { code: 'INVALID_FILE_TYPE', message: err.message } });
  }

  return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`\n🏥 Care Connect Hub API`);
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Allowed origins: ${allowedOrigins.join(', ')}\n`);
});

export default app;