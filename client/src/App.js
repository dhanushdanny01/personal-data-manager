/**
 * Main App Component
 * 
 * This is the root component with authentication integration.
 * It manages routing and provides authentication context.
 * 
 * Data Flow:
 * User Interaction -> App -> Auth Context -> Components
 * User Interaction <- App <- Auth Context <- Components
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Login from './pages/Login';
import Signup from './pages/Signup';

// Import components
import DataForm from './components/DataForm';
import DataList from './components/DataList';
import SearchBar from './components/SearchBar';
import Pagination from './components/Pagination';

// Import styles
import './App.css';

// Dashboard component with CRUD operations and RBAC
const Dashboard = () => {
  const { user, logout, role } = useAuth();
  
  // State management for data records
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Base URL for API calls
  const API_URL = '/api/data';

  /**
   * Fetch all records from the backend with pagination
   * This function is called on component mount, when search term changes, or page changes
   */
  const fetchRecords = async (page = 1) => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters including pagination
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      });
      
      // Include search term in query if exists
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      const url = `${API_URL}?${params}`;
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setRecords(response.data.data);
        setPagination(response.data.pagination);
        // Update role from backend response
        if (response.data.userRole && response.data.userRole !== role) {
          // Role has changed (admin updated user role)
          // You might want to refresh user context here
        }
      } else {
        setError('Failed to fetch records');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create or update a record
   * @param {Object} recordData - The record data to save
   */
  const saveRecord = async (recordData) => {
    try {
      setLoading(true);
      setError('');
      
      let response;
      if (editingRecord) {
        // Update existing record
        response = await axios.put(`${API_URL}/${editingRecord._id}`, recordData);
      } else {
        // Create new record
        response = await axios.post(API_URL, recordData);
      }
      
      if (response.data.success) {
        setEditingRecord(null);
        fetchRecords(pagination.currentPage); // Refresh current page
      } else {
        setError(response.data.message || 'Failed to save record');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving record');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete a record
   * @param {string} id - The ID of the record to delete
   */
  const deleteRecord = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.delete(`${API_URL}/${id}`);
      
      if (response.data.success) {
        fetchRecords(pagination.currentPage); // Refresh current page
      } else {
        setError(response.data.message || 'Failed to delete record');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting record');
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle edit button click
   * @param {Object} record - The record to edit
   */
  const handleEdit = (record) => {
    setEditingRecord(record);
  };

  /**
   * Handle cancel edit
   */
  const handleCancelEdit = () => {
    setEditingRecord(null);
  };

  /**
   * Handle search term change
   * @param {string} term - The search term
   */
  const handleSearch = (term) => {
    setSearchTerm(term);
    // Reset to page 1 when searching
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  /**
   * Handle page change
   * @param {number} page - The new page number
   */
  const handlePageChange = (page) => {
    fetchRecords(page);
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  // Fetch records on component mount and when search term changes
  useEffect(() => {
    fetchRecords(1);
  }, [searchTerm]); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <div className="App">
      <header className="App-header">
        <h1>Personal Data Manager</h1>
        <p>Manage your personal data with ease</p>
      </header>

      <main className="App-main">
        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <span>Loading...</span>
          </div>
        )}

        {/* Search Bar */}
        <SearchBar 
          onSearch={handleSearch} 
          searchTerm={searchTerm}
          disabled={loading}
        />

        {/* Data Form - for creating and editing records */}
        <DataForm 
          onSave={saveRecord}
          editingRecord={editingRecord}
          onCancelEdit={handleCancelEdit}
          disabled={loading}
        />

        {/* Data List - displays all records with role-based permissions */}
        <DataList 
          records={records}
          onEdit={handleEdit}
          onDelete={deleteRecord}
          disabled={loading}
          userRole={role} // Pass role to DataList for RBAC UI
        />

        {/* Pagination Component */}
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalRecords={pagination.totalRecords}
          limit={pagination.limit}
          hasNextPage={pagination.hasNextPage}
          hasPrevPage={pagination.hasPrevPage}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </main>

      <footer className="App-footer">
        <p>
          Welcome, {user?.username}! 
          <button onClick={handleLogout} className="btn btn-secondary" style={{marginLeft: '1rem'}}>
            Logout
          </button>
        </p>
      </footer>
    </div>
  );
};

// Main App component with routing
const AppWithAuth = () => {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
};

export default AppWithAuth;
