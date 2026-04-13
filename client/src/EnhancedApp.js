/**
 * Enhanced App Component with Production Features
 * 
 * This component includes error boundaries, performance monitoring,
 * lazy loading, and advanced state management.
 * 
 * System Design Concepts:
 * - Performance: Code splitting and lazy loading
 * - Reliability: Error boundaries and fallbacks
 * - User Experience: Loading states and smooth transitions
 */

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy load components for better performance
const Login = React.lazy(() => import('./pages/Login'));
const Signup = React.lazy(() => import('./pages/Signup'));
const Dashboard = React.lazy(() => import('./components/Dashboard'));
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));

// Import styles
import './EnhancedApp.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to monitoring service
    console.error('Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong!</h2>
          <details>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
          <button onClick={() => window.location.reload()}>
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading Component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner"></div>
    <p>Loading application...</p>
  </div>
);

// Performance monitoring
const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRender: null,
    renderTime: 0
  });

  useEffect(() => {
    const startTime = performance.now();
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      lastRender: new Date(),
      renderTime: performance.now() - startTime
    }));
  });

  return metrics;
};

// Main App Component
const AppWithAuth = () => {
  const { user, logout } = useAuth();
  const performanceMetrics = usePerformanceMonitor();

  // Setup axios defaults and interceptors
  useEffect(() => {
    // Request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        // Add request ID for tracking
        config.metadata = { startTime: Date.now() };
        config.headers['X-Request-ID'] = generateRequestId();
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for performance monitoring
    const responseInterceptor = axios.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        
        // Log slow requests
        if (duration > 1000) {
          console.warn(`Slow API request: ${response.config.url} took ${duration}ms`);
        }
        
        return response;
      },
      (error) => {
        // Handle different error types
        if (error.response?.status === 401) {
          // Token expired - logout user
          logout();
        } else if (error.response?.status >= 500) {
          // Server error - show user-friendly message
          console.error('Server error:', error.response.data);
        }
        
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [logout]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any ongoing requests
      axios.CancelToken.source().cancel('Component unmounted');
    };
  }, []);

  // Generate unique request ID
  const generateRequestId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Handle online/offline status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Performance monitoring (development only)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', performanceMetrics);
    }
  }, [performanceMetrics]);

  if (!isOnline) {
    return (
      <div className="offline-message">
        <h2>You're offline</h2>
        <p>Please check your internet connection and try again.</p>
        <button onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="app">
          {/* Global loading indicator */}
          <div className={`global-loading ${performanceMetrics.renderTime > 100 ? 'slow' : ''}`}>
            {performanceMetrics.renderTime > 100 && (
              <span>Slow render detected</span>
            )}
          </div>

          {/* Main routes with lazy loading */}
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>

          {/* Global footer with app info */}
          <footer className="app-footer">
            <div className="footer-content">
              <p>
                Personal Data Manager v2.0 | 
                {user ? `Logged in as ${user.username}` : 'Not logged in'}
              </p>
              <div className="footer-links">
                {process.env.NODE_ENV === 'development' && (
                  <span className="dev-info">
                    Renders: {performanceMetrics.renderCount} | 
                    Last render: {performanceMetrics.renderTime.toFixed(2)}ms
                  </span>
                )}
              </div>
            </div>
          </footer>
        </div>
      </Router>
    </ErrorBoundary>
  );
};

// Main App Component
const App = () => {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  );
};

export default App;
