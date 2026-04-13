/**
 * SearchBar Component
 * 
 * This component provides search functionality to filter records by title.
 * It includes debounced search to avoid excessive API calls.
 * 
 * Props:
 * - onSearch: Function to call when search term changes
 * - searchTerm: Current search term
 * - disabled: Boolean to disable input during loading
 */

import React, { useState, useEffect } from 'react';

const SearchBar = ({ onSearch, searchTerm, disabled }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [debounceTimer, setDebounceTimer] = useState(null);

  /**
   * Update local search term when prop changes
   */
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  /**
   * Handle input change with debouncing
   * @param {Object} e - The event object
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setLocalSearchTerm(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer for debounced search
    const newTimer = setTimeout(() => {
      onSearch(value);
    }, 300); // 300ms debounce delay

    setDebounceTimer(newTimer);
  };

  /**
   * Handle clear search
   */
  const handleClear = () => {
    setLocalSearchTerm('');
    onSearch('');
    
    // Clear timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      setDebounceTimer(null);
    }
  };

  /**
   * Cleanup timer on unmount
   */
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className="search-bar">
      <div className="search-input-container">
        <input
          type="text"
          value={localSearchTerm}
          onChange={handleChange}
          disabled={disabled}
          className="search-input"
          placeholder="Search records by title..."
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            disabled={disabled}
            className="search-clear"
            title="Clear search"
          >
            ✕
          </button>
        )}
      </div>
      {localSearchTerm && (
        <div className="search-info">
          Searching for: <strong>{localSearchTerm}</strong>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
