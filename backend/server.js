import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import supabase from './supabase/client';

dotenv.config();

const app = express();

// ==============================================
// App Settings & Configuration
// ==============================================

// Trust proxy configuration for deployment environments (Render, etc.)
// Enables proper handling of X-Forwarded-* headers from reverse proxies
app.set('trust proxy', 1);

// Routing configuration for consistent URL handling
app.set('case sensitive routing', true);
app.set('strict routing', true);

// ==============================================
// Security & Middleware Stack
// ==============================================

// Security headers middleware (helmet)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || [
      'http://localhost:3000',
      'http://localhost:5173',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Request logging middleware (morgan)
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==============================================
// Routes
// ==============================================

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CanAI Backend Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Dedicated health endpoint for monitoring
app.get('/health', async (req, res) => {
  try {
    // Attempt a simple Supabase query (adjust table name as needed)
    const { error } = await supabase.from('profiles').select('id').limit(1);
    if (error) throw error;
    res.status(200).json({
      status: 'healthy',
      supabase: 'healthy',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      supabase: 'unhealthy',
      error: err.message,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: process.memoryUsage(),
    });
  }
});

// TODO: Add API routes
// TODO: Add authentication routes
// TODO: Add webhook routes

// ==============================================
// Error Handling
// ==============================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message,
    timestamp: new Date().toISOString(),
  });
});

// ==============================================
// Server Configuration
// ==============================================

// Match Render's port or local testing
const PORT = process.env.PORT || 10000;

const server = app.listen(PORT, () => {
  console.log(`🚀 CanAI Backend Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔒 Security headers: enabled`);
  console.log(`🌐 CORS: configured`);
  console.log(
    `📝 Logging: ${process.env.NODE_ENV === 'production' ? 'combined' : 'dev'}`
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
