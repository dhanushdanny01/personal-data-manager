/**
 * Authentication Middleware
 * 
 * This middleware verifies JWT tokens and protects routes.
 * It checks for valid JWT token in Authorization header.
 * 
 * Data Flow:
 * Protected Route -> Auth Middleware -> Verify Token -> Continue to Controller
 * 
 * Usage: Add to any route that requires authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.substring(7);

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      // Get user with role information
      const user = await User.findById(decoded.id).select('role email username');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found.'
        });
      }
      
      // Add user info to request object
      req.user = {
        id: user._id,
        role: user.role,
        email: user.email,
        username: user.username
      };
      
      next();
      
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid.'
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};
