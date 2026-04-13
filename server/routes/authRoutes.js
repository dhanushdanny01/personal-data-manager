/**
 * Authentication Routes
 * 
 * This file defines the authentication endpoints:
 * - POST /api/auth/signup - Register new user
 * - POST /api/auth/login - Login user
 * 
 * API Flow:
 * Client Request -> Route -> Controller -> Model -> Database
 * Client Response <- Route <- Controller <- Model <- Database
 */

const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access   Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access   Public
 */
router.post('/login', login);

module.exports = router;
