const express      = require('express');
const cors         = require('cors');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const path         = require('path');
require('dotenv').config();

const { testConnection, query }    = require('./config/db');
const { ensureReviewReplyColumns } = require('./utils/dbMigrations');
const { notFound, errorHandler }   = require('./middleware/errorHandler');

// ─── Route Imports ────────────────────────────────────────────────────────────
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes    = require('./routes/cartRoutes');
const contactRoutes = require('./routes/contactRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes   = require('./routes/adminRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3001',  // Admin panel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.set('trust proxy', 1);
// ─── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max     : parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  standardHeaders: true,
  legacyHeaders  : false,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', (req, res, next) => {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  return limiter(req, res, next);
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max     : 10,
  message : { success: false, message: 'Too many auth attempts. Please try again in 15 minutes.' },
});

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Logger ───────────────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Static Files ─────────────────────────────────────────────────────────────
const sharedImagesDir = path.resolve(__dirname, '../shared/images');
app.use('/images', express.static(sharedImagesDir));
app.use('/shared', express.static(path.resolve(__dirname, '../shared')));

// Migration helpers moved to backend/utils/dbMigrations.js

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success  : true,
    message  : 'Moniluck API is running',
    timestamp: new Date().toISOString(),
    version  : '1.0.0',
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart',     cartRoutes);
app.use('/api/contact',  contactRoutes);
app.use('/api/settings',  settingsRoutes);
app.use('/api/admin',    adminRoutes);


app.use('/admin', express.static(path.join(__dirname, 'public-admin')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public-admin', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'public-frontend')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public-frontend', 'index.html'));
}); 

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const startServer = async () => {
  await testConnection();
  await ensureReviewReplyColumns();
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║        MONILUCK SERVER STARTED                                                 ║
╠════════════════════════════════════════╣
║  Port    : ${PORT}                                                                            ║
║  Mode    : ${process.env.NODE_ENV || 'development'}                 ║
║  API     : http://localhost:${PORT}/api                                            ║
╚════════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = app;