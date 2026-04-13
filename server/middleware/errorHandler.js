/**
 * Centralized Error Handling Middleware
 * 
 * This middleware handles all errors in a consistent way and provides
 * structured error responses for better debugging and user experience.
 * 
 * System Design Concepts:
 * - Reliability: Consistent error handling across the application
 * - Security: Prevents sensitive information leakage
 * - Debugging: Detailed error logging for troubleshooting
 */

const logger = require('./logger');

// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, details) {
    super(message, 400, details);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

// Handle MongoDB CastError (invalid ObjectId)
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// Handle MongoDB duplicate fields
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// Handle MongoDB validation errors
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => ({
    field: el.path,
    message: el.message
  }));
  
  const message = 'Invalid input data';
  return new ValidationError(message, errors);
};

// Handle JWT errors
const handleJWTError = () =>
  new AuthenticationError('Invalid token. Please log in again!');

// Handle JWT expired error
const handleJWTExpiredError = () =>
  new AuthenticationError('Your token has expired! Please log in again.');

// Send error response in development
const sendErrorDev = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      details: err.details,
      stack: err.stack,
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // B) RENDERED WEBSITE
  console.error('ERROR 💥', err);
  return res.status(err.statusCode).json({
    title: 'Something went wrong!',
    msg: err.message
  });
};

// Send error response in production
const sendErrorProd = (err, req, res) => {
  // A) API
  if (req.originalUrl.startsWith('/api')) {
    // A) Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        error: err,
        message: err.message,
        details: err.details,
        timestamp: new Date().toISOString(),
        requestId: req.id || 'unknown'
      });
    }

    // B) Programming or other unknown error: don't leak error details
    logger.error('ERROR 💥', err);
    
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Something went wrong!',
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    });
  }

  // B) RENDERED WEBSITE
  // A) Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      title: 'Something went wrong!',
      msg: err.message
    });
  }

  // B) Programming or other unknown error: don't leak error details
  logger.error('ERROR 💥', err);
  
  return res.status(err.statusCode).json({
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

// Global error handling middleware
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the error
  logger.error({
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    requestId: req.id || 'unknown'
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  
  // Give server time to finish pending requests before shutting down
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

module.exports = {
  globalErrorHandler,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
