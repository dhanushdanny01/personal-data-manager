/**
 * DataForm Component
 * 
 * This component handles the form for creating and editing data records.
 * It includes form validation and state management for form inputs.
 * 
 * Props:
 * - onSave: Function to call when form is submitted
 * - editingRecord: Record being edited (null for new record)
 * - onCancelEdit: Function to call when canceling edit
 * - disabled: Boolean to disable form inputs during loading
 */

import React, { useState, useEffect } from 'react';

const DataForm = ({ onSave, editingRecord, onCancelEdit, disabled }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  /**
   * Initialize form data when editing record changes
   */
  useEffect(() => {
    if (editingRecord) {
      setFormData({
        title: editingRecord.title,
        description: editingRecord.description
      });
    } else {
      setFormData({
        title: '',
        description: ''
      });
    }
    // Clear errors when switching between create/edit modes
    setErrors({});
  }, [editingRecord]);

  /**
   * Handle input changes
   * @param {Object} e - The event object
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Validate form data
   * @returns {boolean} - True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title cannot exceed 100 characters';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   * @param {Object} e - The event object
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    onSave({
      title: formData.title.trim(),
      description: formData.description.trim()
    });
    
    // Reset form after successful save
    if (!editingRecord) {
      setFormData({
        title: '',
        description: ''
      });
    }
  };

  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setFormData({
      title: '',
      description: ''
    });
    setErrors({});
    onCancelEdit();
  };

  return (
    <div className="data-form">
      <h2>{editingRecord ? 'Edit Record' : 'Add New Record'}</h2>
      
      <form onSubmit={handleSubmit} className="form">
        {/* Title Field */}
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            disabled={disabled}
            className={errors.title ? 'error' : ''}
            placeholder="Enter title (max 100 characters)"
            maxLength="100"
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Description Field */}
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            disabled={disabled}
            className={errors.description ? 'error' : ''}
            placeholder="Enter description (max 500 characters)"
            maxLength="500"
            rows="4"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={disabled}
            className="btn btn-primary"
          >
            {disabled ? 'Saving...' : (editingRecord ? 'Update Record' : 'Add Record')}
          </button>
          
          {editingRecord && (
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={disabled}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default DataForm;
