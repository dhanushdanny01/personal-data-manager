/**
 * Production Configuration
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.onrender.com' // Replace with your actual backend URL
  : 'http://localhost:5002';

export const API_URL = `${API_BASE_URL}/api`;
export const WS_URL = API_BASE_URL.replace('http', 'ws');

export const CONFIG = {
  API_URL,
  WS_URL,
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  VERSION: '2.0.0'
};
