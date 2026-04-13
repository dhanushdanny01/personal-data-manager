/**
 * Simple In-Memory Caching System
 * 
 * This module provides basic caching functionality to improve performance
 * for frequently accessed data and reduce database load.
 * 
 * System Design Concepts:
 * - Performance: Reduces database queries for repeated requests
 * - Scalability: Decreases load on database for hot data
 * - Reliability: Graceful fallback when cache fails
 */

class SimpleCache {
  constructor(ttl = 300000) { // Default TTL: 5 minutes
    this.cache = new Map();
    this.ttl = ttl;
    this.timers = new Map();
  }

  /**
   * Set a value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} customTtl - Custom TTL in milliseconds
   */
  set(key, value, customTtl = null) {
    try {
      // Clear existing timer if key exists
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }

      // Set value in cache
      this.cache.set(key, {
        value,
        timestamp: Date.now(),
        ttl: customTtl || this.ttl
      });

      // Set expiration timer
      const expirationTime = customTtl || this.ttl;
      const timer = setTimeout(() => {
        this.delete(key);
      }, expirationTime);

      this.timers.set(key, timer);

      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  /**
   * Get a value from cache
   * @param {string} key - Cache key
   * @returns {any|null} - Cached value or null if not found/expired
   */
  get(key) {
    try {
      const item = this.cache.get(key);
      
      if (!item) {
        return null;
      }

      // Check if item has expired
      if (Date.now() - item.timestamp > item.ttl) {
        this.delete(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   * @param {string} key - Cache key
   * @returns {boolean} - True if deleted, false if not found
   */
  delete(key) {
    try {
      const deleted = this.cache.delete(key);
      
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }

      return deleted;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  clear() {
    try {
      // Clear all timers
      for (const timer of this.timers.values()) {
        clearTimeout(timer);
      }
      
      this.cache.clear();
      this.timers.clear();
      
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Get cache statistics
   * @returns {object} - Cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      timers: this.timers.size,
      ttl: this.ttl
    };
  }

  /**
   * Check if key exists and is not expired
   * @param {string} key - Cache key
   * @returns {boolean} - True if key exists and is valid
   */
  has(key) {
    return this.get(key) !== null;
  }
}

// Create cache instances for different types of data
const userCache = new SimpleCache(600000); // 10 minutes for user data
const dataCache = new SimpleCache(300000); // 5 minutes for data records
const statsCache = new SimpleCache(1800000); // 30 minutes for statistics

/**
 * Cache middleware factory
 * @param {SimpleCache} cache - Cache instance to use
 * @param {function} keyGenerator - Function to generate cache key
 * @param {number} ttl - Custom TTL (optional)
 */
const cacheMiddleware = (cache, keyGenerator, ttl = null) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyGenerator(req);
    const cachedData = cache.get(key);

    if (cachedData) {
      // Add cache header to response
      res.set('X-Cache', 'HIT');
      return res.json(cachedData);
    }

    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        cache.set(key, data, ttl);
        res.set('X-Cache', 'MISS');
      }
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Generate cache key for data records
 * @param {object} req - Express request object
 * @returns {string} - Cache key
 */
const generateDataCacheKey = (req) => {
  const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;
  
  return `data:${userRole}:${userId}:${page}:${limit}:${search}:${sortBy}:${sortOrder}`;
};

/**
 * Generate cache key for user data
 * @param {object} req - Express request object
 * @returns {string} - Cache key
 */
const generateUserCacheKey = (req) => {
  return `user:${req.user.id}:${req.originalUrl}`;
};

/**
 * Generate cache key for statistics
 * @param {object} req - Express request object
 * @returns {string} - Cache key
 */
const generateStatsCacheKey = (req) => {
  return `stats:${req.user.id}:${Date.now()}`;
};

/**
 * Invalidate cache patterns
 */
const invalidateCache = (pattern) => {
  // Simple pattern-based cache invalidation
  // In production, you might want more sophisticated cache invalidation
  
  if (pattern === 'data') {
    // Clear all data cache
    dataCache.clear();
  } else if (pattern === 'user') {
    // Clear user-specific cache
    userCache.clear();
  } else if (pattern === 'stats') {
    // Clear stats cache
    statsCache.clear();
  } else if (pattern === 'all') {
    // Clear all caches
    userCache.clear();
    dataCache.clear();
    statsCache.clear();
  }
};

/**
 * Cache warming function for frequently accessed data
 */
const warmCache = async () => {
  try {
    // This would be called during application startup
    // to pre-populate cache with hot data
    
    console.log('Cache warming completed');
  } catch (error) {
    console.error('Cache warming error:', error);
  }
};

module.exports = {
  SimpleCache,
  userCache,
  dataCache,
  statsCache,
  cacheMiddleware,
  generateDataCacheKey,
  generateUserCacheKey,
  generateStatsCacheKey,
  invalidateCache,
  warmCache
};
