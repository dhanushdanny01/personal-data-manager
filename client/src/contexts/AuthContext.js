/**
 * Authentication Context
 * 
 * This context provides authentication state to the entire application.
 * It manages user login state and provides auth methods.
 * 
 * Data Flow:
 * Auth Context -> Components (global state)
 * Components -> Auth Context (state updates)
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import * as authService from '../services/authService';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  role: null // Add role to initial state
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_REQUEST: 'LOGIN_REQUEST',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_REQUEST: 'REGISTER_REQUEST',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_REQUEST:
    case AUTH_ACTIONS.REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        role: action.payload.user?.role || 'user' // Set role from user data
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        role: null // Reset role on logout
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.setAuthHeader();
      // You could validate token here if needed
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: {
          user: null, // We don't have user info, just token
          token
        }
      });
    }
  }, []);

  const value = {
    ...state,
    dispatch,
    login: async (credentials) => {
      dispatch({ type: AUTH_ACTIONS.LOGIN_REQUEST });
      try {
        const response = await authService.login(credentials);
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: response.data
        });
        return response;
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.LOGIN_FAILURE,
          payload: error.message
        });
        throw error;
      }
    },
    register: async (userData) => {
      dispatch({ type: AUTH_ACTIONS.REGISTER_REQUEST });
      try {
        const response = await authService.register(userData);
        dispatch({
          type: AUTH_ACTIONS.REGISTER_SUCCESS,
          payload: response.data
        });
        return response;
      } catch (error) {
        dispatch({
          type: AUTH_ACTIONS.REGISTER_FAILURE,
          payload: error.message
        });
        throw error;
      }
    },
    logout: () => {
      authService.logout();
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    },
    clearError: () => {
      dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
