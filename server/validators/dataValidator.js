/**
 * Input Validation using Joi
 * 
 * This module provides comprehensive input validation for all API endpoints.
 * 
 * System Design Concepts:
 * - Security: Prevents injection attacks and invalid data
 * - Reliability: Ensures data integrity and consistency
 * - Performance: Early validation reduces unnecessary processing
 */

const Joi = require('joi');

// Common validation patterns
const patterns = {
  objectId: /^[0-9a-fA-F]{24}$/,
  email: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
};

// DataRecord validation schemas
const dataRecordSchemas = {
  create: Joi.object({
    title: Joi.string()
      .required()
      .min(1)
      .max(100)
      .trim()
      .messages({
        'string.empty': 'Title is required',
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title cannot exceed 100 characters',
        'any.required': 'Title is required'
      }),
    description: Joi.string()
      .required()
      .min(1)
      .max(500)
      .trim()
      .messages({
        'string.empty': 'Description is required',
        'string.min': 'Description must be at least 1 character long',
        'string.max': 'Description cannot exceed 500 characters',
        'any.required': 'Description is required'
      })
  }),

  update: Joi.object({
    title: Joi.string()
      .min(1)
      .max(100)
      .trim()
      .messages({
        'string.min': 'Title must be at least 1 character long',
        'string.max': 'Title cannot exceed 100 characters'
      }),
    description: Joi.string()
      .min(1)
      .max(500)
      .trim()
      .messages({
        'string.min': 'Description must be at least 1 character long',
        'string.max': 'Description cannot exceed 500 characters'
      })
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update'
  }),

  // Query parameter validation
  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1'
      }),
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100'
      }),
    sortBy: Joi.string()
      .valid('title', 'description', 'createdAt', 'updatedAt')
      .default('createdAt')
      .messages({
        'any.only': 'SortBy must be one of: title, description, createdAt, updatedAt'
      }),
    sortOrder: Joi.string()
      .valid('asc', 'desc')
      .default('desc')
      .messages({
        'any.only': 'SortOrder must be either asc or desc'
      }),
    search: Joi.string()
      .max(100)
      .allow('')
      .default('')
      .messages({
        'string.max': 'Search term cannot exceed 100 characters'
      })
  })
};

// User validation schemas
const userSchemas = {
  register: Joi.object({
    username: Joi.string()
      .required()
      .min(3)
      .max(30)
      .trim()
      .pattern(/^[a-zA-Z0-9_]+$/)
      .messages({
        'string.empty': 'Username is required',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'string.pattern.base': 'Username can only contain letters, numbers, and underscores',
        'any.required': 'Username is required'
      }),
    email: Joi.string()
      .required()
      .email()
      .max(100)
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'string.max': 'Email cannot exceed 100 characters',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .min(6)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'string.max': 'Password cannot exceed 128 characters',
        'string.pattern.base': 'Password must contain at least one lowercase letter, one uppercase letter, and one number',
        'any.required': 'Password is required'
      })
  }),

  login: Joi.object({
    email: Joi.string()
      .required()
      .email()
      .messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
      }),
    password: Joi.string()
      .required()
      .messages({
        'string.empty': 'Password is required',
        'any.required': 'Password is required'
      })
  })
};

// Validation middleware factory
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context.value
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: 'Invalid input data',
        details: errors,
        timestamp: new Date().toISOString()
      });
    }

    // Replace the request data with validated and sanitized data
    req[source] = value;
    next();
  };
};

module.exports = {
  validate,
  dataRecordSchemas,
  userSchemas,
  patterns
};
