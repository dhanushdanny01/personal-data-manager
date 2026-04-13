/**
 * Production Configuration
 * 
 * This module handles production-specific configurations including
 * environment variables, security settings, and deployment options.
 * 
 * System Design Concepts:
 * - Security: Environment-based configuration management
 * - Scalability: Production-optimized settings
 * - Monitoring: Health checks and metrics collection
 */

const path = require('path');
const fs = require('fs');

// Validate required environment variables
const validateEnvironment = () => {
  const required = [
    'NODE_ENV',
    'PORT',
    'MONGODB_URI',
    'JWT_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret strength
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate MongoDB URI format
  try {
    new URL(process.env.MONGODB_URI);
  } catch (error) {
    throw new Error('Invalid MONGODB_URI format');
  }
};

// Production configuration
const productionConfig = {
  // Server settings
  port: parseInt(process.env.PORT) || 5002,
  host: process.env.HOST || '0.0.0.0',
  
  // Database settings
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    }
  },
  
  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    issuer: process.env.JWT_ISSUER || 'personal-data-manager',
    audience: process.env.JWT_AUDIENCE || 'pdm-users'
  },
  
  // CORS settings
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
    optionsSuccessStatus: 200
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.RATE_LIMIT_MAX || 100,
    message: {
      success: false,
      error: 'Too many requests, please try again later'
    }
  },
  
  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json',
    file: {
      enabled: process.env.LOG_FILE_ENABLED !== 'false',
      path: process.env.LOG_FILE_PATH || './logs',
      maxSize: process.env.LOG_MAX_SIZE || '5MB',
      maxFiles: process.env.LOG_MAX_FILES || 5
    }
  },
  
  // Cache settings
  cache: {
    ttl: parseInt(process.env.CACHE_TTL) || 300000, // 5 minutes
    maxSize: parseInt(process.env.CACHE_MAX_SIZE) || 1000
  },
  
  // Security settings
  security: {
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    },
    compression: {
      enabled: process.env.COMPRESSION_ENABLED !== 'false',
      level: parseInt(process.env.COMPRESSION_LEVEL) || 6
    }
  },
  
  // Monitoring settings
  monitoring: {
    enabled: process.env.MONITORING_ENABLED !== 'false',
    metrics: {
      enabled: process.env.METRICS_ENABLED !== 'false',
      endpoint: process.env.METRICS_ENDPOINT || '/metrics'
    },
    healthCheck: {
      enabled: process.env.HEALTH_CHECK_ENABLED !== 'false',
      endpoint: process.env.HEALTH_CHECK_ENDPOINT || '/health'
    }
  }
};

// Development configuration (fallbacks)
const developmentConfig = {
  ...productionConfig,
  port: 5002,
  database: {
    ...productionConfig.database,
    options: {
      ...productionConfig.database.options,
      bufferMaxEntries: 0
    }
  },
  rateLimit: {
    ...productionConfig.rateLimit,
    max: 1000 // More lenient for development
  },
  logging: {
    ...productionConfig.logging,
    level: 'debug'
  }
};

// Get configuration based on environment
const getConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  if (env === 'production') {
    validateEnvironment();
    return productionConfig;
  }
  
  return developmentConfig;
};

// Create logs directory if it doesn't exist
const ensureLogsDirectory = () => {
  const logPath = productionConfig.logging.file.path;
  
  if (!fs.existsSync(logPath)) {
    try {
      fs.mkdirSync(logPath, { recursive: true });
      console.log(`Created logs directory: ${logPath}`);
    } catch (error) {
      console.error('Failed to create logs directory:', error);
    }
  }
};

// Deployment platform detection
const detectDeploymentPlatform = () => {
  const platform = {
    name: 'unknown',
    environment: process.env.NODE_ENV || 'development',
    
    // Detect common platforms
    isHeroku: !!process.env.DYNO,
    isVercel: !!process.env.VERCEL,
    isRender: !!process.env.RENDER,
    isAWS: !!process.env.AWS_LAMBDA_FUNCTION_NAME,
    isDocker: !!process.env.DOCKER_CONTAINER,
    
    // Get platform-specific settings
    settings: {}
  };
  
  if (platform.isHeroku) {
    platform.name = 'Heroku';
    platform.settings = {
      port: process.env.PORT,
      database: {
        uri: process.env.DATABASE_URL
      }
    };
  } else if (platform.isVercel) {
    platform.name = 'Vercel';
    platform.settings = {
      port: process.env.PORT || 3000
    };
  } else if (platform.isRender) {
    platform.name = 'Render';
    platform.settings = {
      port: process.env.PORT || 10000
    };
  } else if (platform.isAWS) {
    platform.name = 'AWS Lambda';
  } else if (platform.isDocker) {
    platform.name = 'Docker';
  }
  
  return platform;
};

// Environment-specific optimizations
const applyOptimizations = (config) => {
  const platform = detectDeploymentPlatform();
  
  // Apply platform-specific optimizations
  switch (platform.name) {
    case 'Heroku':
      // Heroku-specific optimizations
      config.database.options.maxPoolSize = 5; // Heroku limits
      break;
      
    case 'Vercel':
      // Vercel (serverless) optimizations
      config.database.options.maxPoolSize = 1;
      break;
      
    case 'Render':
      // Render-specific settings
      config.database.options.maxPoolSize = 10;
      break;
  }
  
  return config;
};

// Export configuration and utilities
module.exports = {
  getConfig,
  validateEnvironment,
  ensureLogsDirectory,
  detectDeploymentPlatform,
  applyOptimizations,
  productionConfig,
  developmentConfig
};
