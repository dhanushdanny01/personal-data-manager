/**
 * Pagination Component
 * 
 * This component provides navigation controls for paginated data.
 * It handles page navigation and displays pagination info.
 * 
 * Data Flow:
 * User Interaction -> Pagination Component -> Parent Component -> API
 * User Interaction <- Pagination Component <- Parent Component <- API
 */

import React from 'react';
import './Pagination.css';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalRecords, 
  limit, 
  hasNextPage, 
  hasPrevPage, 
  onPageChange, 
  loading 
}) => {
  /**
   * Handle page navigation
   * @param {number} page - Target page number
   */
  const handlePageChange = (page) => {
    if (!loading && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  /**
   * Generate page numbers for display
   * Shows current page, previous, next, and some surrounding pages
   */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    
    return pages;
  };

  // Don't render if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} records
        </span>
      </div>
      
      <div className="pagination-controls">
        {/* Previous Button */}
        <button
          className="pagination-btn prev-btn"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevPage || loading}
          aria-label="Previous page"
        >
          ← Previous
        </button>

        {/* Page Numbers */}
        <div className="pagination-numbers">
          {getPageNumbers().map((page, index) => (
            <span key={index}>
              {page === '...' ? (
                <span className="pagination-ellipsis">...</span>
              ) : (
                <button
                  className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                  onClick={() => handlePageChange(page)}
                  disabled={loading}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Next Button */}
        <button
          className="pagination-btn next-btn"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage || loading}
          aria-label="Next page"
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default Pagination;
