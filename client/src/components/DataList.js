/**
 * Data List Component
 * 
 * This component displays a list of data records with role-based permissions.
 * It provides edit and delete functionality based on user role.
 * 
 * Data Flow:
 * Props -> Component -> API Calls (if needed)
 * User Interaction -> Component -> Parent Component
 */

import React from 'react';
import './DataList.css';

const DataList = ({ 
  records, 
  onEdit, 
  onDelete, 
  disabled, 
  userRole = 'user' // Default to user role
}) => {
  /**
   * Format date for display
   * @param {string} dateString - ISO date string
   * @returns {string} - Formatted date string
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Check if user can edit this record
   * @param {Object} record - The record to check
   * @returns {boolean} - Whether user can edit
   */
  const canEditRecord = (record) => {
    // Admin can edit any record
    if (userRole === 'admin') return true;
    // User can only edit their own records (if we had user info)
    // For now, users can edit all records they can see
    return userRole === 'user';
  };

  /**
   * Check if user can delete this record
   * @param {Object} record - The record to check
   * @returns {boolean} - Whether user can delete
   */
  const canDeleteRecord = (record) => {
    // Admin can delete any record
    if (userRole === 'admin') return true;
    // User can only delete their own records (if we had user info)
    // For now, users can delete all records they can see
    return userRole === 'user';
  };

  /**
   * Handle edit button click
   * @param {Object} record - The record to edit
   */
  const handleEdit = (record) => {
    if (canEditRecord(record)) {
      onEdit(record);
    }
  };

  /**
   * Handle delete button click
   * @param {string} id - The ID of the record to delete
   */
  const handleDelete = (id) => {
    if (userRole === 'admin' || userRole === 'user') {
      onDelete(id);
    }
  };

  return (
    <div className="data-list">
      <h2>Records ({records.length})</h2>
      
      {records.length === 0 ? (
        <div className="empty-state">
          <p>No records found. Add your first record above!</p>
        </div>
      ) : (
        <div className="records-grid">
          {records.map((record) => (
            <div key={record._id} className="record-card">
              <div className="record-header">
                <h3 className="record-title">{record.title}</h3>
                <div className="record-actions">
                  {/* Show edit button only if user can edit */}
                  {canEditRecord(record) && (
                    <button
                      onClick={() => handleEdit(record)}
                      disabled={disabled}
                      className="btn btn-edit"
                      title="Edit record"
                    >
                      ✏️
                    </button>
                  )}
                  
                  {/* Show delete button only if user can delete */}
                  {canDeleteRecord(record) && (
                    <button
                      onClick={() => handleDelete(record._id)}
                      disabled={disabled}
                      className="btn btn-delete"
                      title="Delete record"
                    >
                      🗑️
                    </button>
                  )}
                  
                  {/* Show role indicator for admin */}
                  {userRole === 'admin' && (
                    <span className="role-badge" title="Admin Access">👑</span>
                  )}
                </div>
              </div>
              
              <div className="record-content">
                <p className="record-description">{record.description}</p>
              </div>
              
              <div className="record-footer">
                <span className="record-date">
                  Created: {formatDate(record.createdAt)}
                </span>
                {record.updatedAt && record.updatedAt !== record.createdAt && (
                  <span className="record-updated">
                    Updated: {formatDate(record.updatedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DataList;
