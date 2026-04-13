/**
 * Pagination Middleware
 * 
 * This middleware handles pagination parameters and provides
 * a standardized pagination interface for all endpoints.
 * 
 * System Design Concepts:
 * - Performance: Limits data transfer to prevent large payloads
 * - Scalability: Enables handling of large datasets efficiently
 * - User Experience: Provides fast, paginated responses
 */

const getPaginationParams = (req) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder || 'desc';
  const search = req.query.search || '';
  
  // Validate and sanitize parameters
  const validPage = Math.max(1, page);
  const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
  const validSortOrder = ['asc', 'desc'].includes(sortOrder.toLowerCase()) ? sortOrder.toLowerCase() : 'desc';
  
  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit,
    sortBy,
    sortOrder,
    search
  };
};

const buildPaginationResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    success: true,
    data,
    pagination: {
      currentPage: page,
      limit,
      totalItems: total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      itemsOnPage: data.length,
      itemsRemaining: Math.max(0, total - (page * limit))
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown'
    }
  };
};

module.exports = {
  getPaginationParams,
  buildPaginationResponse
};
