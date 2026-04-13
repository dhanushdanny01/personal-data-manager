/**
 * Enhanced Production-Ready Server
 * 
 * This server configuration includes all production features:
 * - Security middleware (helmet, rate limiting)
 * - Performance optimization (compression, caching)
 * - Request logging and monitoring
 * - Error handling and validation
 * 
 * System Design Concepts:
 * - Security: Multiple layers of protection
 * - Performance: Optimization at all levels
 * - Monitoring: Comprehensive logging and metrics
 * - Reliability: Graceful error handling
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { v4: uuidv4 } = require('uuid');

// Import custom middleware
const connectDB = require('./config/database');
const { globalErrorHandler } = require('./middleware/errorHandler');
const { logger, logRequest } = require('./middleware/logger');
const { cacheMiddleware, generateDataCacheKey, dataCache } = require('./middleware/cache');

// Import routes and controllers
const authRoutes = require('./routes/authRoutes');
const { 
  getAllRecords, 
  getRecordById, 
  createRecord, 
  updateRecord, 
  deleteRecord,
  getStats 
} = require('./controllers/enhancedDataController');

// Initialize Express app
const app = express();

// Trust proxy for proper IP detection (important for rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    error: 'Too many authentication attempts, please try again after 15 minutes'
  },
  skipSuccessfulRequests: true,
});

// Performance middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] // Add your production domains
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// Request ID middleware for tracking
app.use((req, res, next) => {
  req.id = uuidv4();
  res.set('X-Request-ID', req.id);
  next();
});

// Request logging middleware
app.use(logRequest);

// Connect to MongoDB database
connectDB();

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    requestId: req.id,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    },
    cache: dataCache.getStats()
  };

  res.status(200).json(healthCheck);
});

// API Routes
/**
 * Authentication routes - Public access with stricter rate limiting
 */
app.use('/api/auth', authLimiter, authRoutes);

/**
 * Data routes - Protected with authentication and caching
 */
app.get('/api/data', 
  cacheMiddleware(dataCache, generateDataCacheKey, 60000), // Cache for 1 minute
  getAllRecords
);

app.get('/api/data/stats', 
  cacheMiddleware(dataCache, (req) => `stats:${req.user.id}`, 300000), // Cache for 5 minutes
  getStats
);

app.get('/api/data/:id', getRecordById);
app.post('/api/data', createRecord);
app.put('/api/data/:id', updateRecord);
app.delete('/api/data/:id', deleteRecord);

// Cache invalidation endpoint (admin only)
app.post('/api/cache/invalidate', (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  const { pattern = 'all' } = req.body;
  const { invalidateCache } = require('./middleware/cache');
  
  invalidateCache(pattern);
  
  logger.info('Cache invalidated', {
    pattern,
    userId: req.user.id,
    requestId: req.id
  });

  res.json({
    success: true,
    message: `Cache invalidated: ${pattern}`,
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - Must be after all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
    requestId: req.id
  });
});

// Global Error Handler - Must be after all other middleware
app.use(globalErrorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(() => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start the server
const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  logger.info(`Health check available at http://localhost:${PORT}/health`);
  
  // Warm up cache
  const { warmCache } = require('./middleware/cache');
  warmCache();
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = app;
