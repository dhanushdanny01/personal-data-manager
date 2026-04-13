/**
 * Main Server File
 * 
 * This is the entry point of the backend application.
 * It sets up the Express server, middleware, and routes.
 * 
 * Architecture Overview:
 * - Routes: Define API endpoints
 * - Controllers: Handle business logic
 * - Models: Define data structure and database operations
 * - Config: Database connection and configuration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');

// Initialize Express app
const app = express();

// Connect to MongoDB database
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies

// API Routes
/**
 * Authentication routes - Public access
 */
app.use('/api/auth', require('./routes/authRoutes'));

/**
 * Data routes - Protected with authentication middleware
 */
app.use('/api/data', require('./middleware/authMiddleware'), require('./routes/dataRoutes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler - Must be after all other routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global Error Handler - Must be after all other middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

module.exports = app;
