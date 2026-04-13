/**
 * Authentication Service
 * 
 * This service handles all authentication-related API calls.
 * It manages JWT tokens and user authentication state.
 * 
 * Data Flow:
 * Component -> Auth Service -> API -> Backend
 * Component <- Auth Service <- API <- Backend
 */

import axios from 'axios';

const API_URL = '/api/auth';

// Store token in localStorage
const TOKEN_KEY = 'token';

/**
 * Set authentication token
 * @param {string} token - JWT token
 */
export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Get authentication token
 * @returns {string|null} JWT token or null
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Remove authentication token
 */
export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Set axios default headers for authenticated requests
 */
export const setAuthHeader = () => {
  const token = getToken();
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
};

/**
 * Remove axios default headers
 */
export const removeAuthHeader = () => {
  delete axios.defaults.headers.common['Authorization'];
};

/**
 * User registration
 * @param {Object} userData - User registration data
 * @returns {Promise} Registration response
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(API_URL + '/signup', userData);
    
    if (response.data.success) {
      const { token } = response.data.data;
      setToken(token);
      setAuthHeader();
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Registration failed' };
  }
};

/**
 * User login
 * @param {Object} credentials - User login credentials
 * @returns {Promise} Login response
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(API_URL + '/login', credentials);
    
    if (response.data.success) {
      const { token } = response.data.data;
      setToken(token);
      setAuthHeader();
    }
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { success: false, message: 'Login failed' };
  }
};

/**
 * User logout
 */
export const logout = () => {
  removeToken();
  removeAuthHeader();
};
