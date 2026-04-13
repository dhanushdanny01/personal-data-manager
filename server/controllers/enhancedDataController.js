/**
 * Enhanced Data Controller with Production Features
 * 
 * This controller implements pagination, search, sorting, validation,
 * error handling, and performance optimization.
 * 
 * System Design Concepts:
 * - Scalability: Efficient pagination and caching
 * - Performance: Optimized database queries
 * - Security: Input validation and RBAC
 * - Reliability: Comprehensive error handling
 */

const DataRecord = require('../models/DataRecord');
const { getPaginationParams, buildPaginationResponse } = require('../middleware/pagination');
const { AppError, NotFoundError, AuthorizationError } = require('../middleware/errorHandler');
const { logPerformance, logUserAction, logDatabaseOperation } = require('../middleware/logger');

/**
 * @desc    Get all data records with advanced features
 * @route   GET /api/data
 * @access  Private
 */
exports.getAllRecords = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Get pagination and filter parameters
    const { page, limit, skip, sortBy, sortOrder, search } = getPaginationParams(req);
    
    logDatabaseOperation('find', 'datarecords', { page, limit, search, sortBy, sortOrder });
    
    // Build base query with RBAC
    let query = {};
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    
    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute queries in parallel for better performance
    const [records, total] = await Promise.all([
      DataRecord.find(query)
        .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username email')
        .lean(), // Use lean() for better performance
      DataRecord.countDocuments(query)
    ]);
    
    logPerformance('getAllRecords', Date.now() - startTime, {
      recordCount: records.length,
      total,
      page,
      limit
    });
    
    // Build response with pagination
    const response = buildPaginationResponse(records, total, page, limit);
    
    // Add metadata about the request
    response.meta.search = search;
    response.meta.sortBy = sortBy;
    response.meta.sortOrder = sortOrder;
    response.meta.userRole = req.user.role;
    
    res.status(200).json(response);
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single data record by ID
 * @route   GET /api/data/:id
 * @access  Private
 */
exports.getRecordById = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid record ID', 400);
    }
    
    logDatabaseOperation('findById', 'datarecords', { id });
    
    // Build query with RBAC
    let query = { _id: id };
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    
    const record = await DataRecord.findOne(query)
      .populate('user', 'username email')
      .lean();
    
    if (!record) {
      throw new NotFoundError('Record not found');
    }
    
    logPerformance('getRecordById', Date.now() - startTime, { id });
    
    res.status(200).json({
      success: true,
      data: record,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new data record
 * @route   POST /api/data
 * @access  Private
 */
exports.createRecord = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { title, description } = req.body;
    
    logDatabaseOperation('create', 'datarecords', { title, description });
    
    // Create record with user association
    const recordData = {
      title,
      description,
      user: req.user.id
    };
    
    const record = await DataRecord.create(recordData);
    
    // Populate user info for response
    await record.populate('user', 'username email');
    
    logUserAction('create_record', req.user.id, {
      recordId: record._id,
      title: record.title
    });
    
    logPerformance('createRecord', Date.now() - startTime, { recordId: record._id });
    
    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: record,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a data record
 * @route   PUT /api/data/:id
 * @access  Private
 */
exports.updateRecord = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid record ID', 400);
    }
    
    logDatabaseOperation('update', 'datarecords', { id, title, description });
    
    // Build query with RBAC
    let query = { _id: id };
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    
    // Find and update record
    const record = await DataRecord.findOneAndUpdate(
      query,
      { title, description },
      { 
        new: true,
        runValidators: true,
        lean: true
      }
    ).populate('user', 'username email');
    
    if (!record) {
      throw new NotFoundError('Record not found or access denied');
    }
    
    logUserAction('update_record', req.user.id, {
      recordId: record._id,
      title: record.title
    });
    
    logPerformance('updateRecord', Date.now() - startTime, { recordId: record._id });
    
    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      data: record,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a data record
 * @route   DELETE /api/data/:id
 * @access  Private (Admin only for others' records)
 */
exports.deleteRecord = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const { id } = req.params;
    
    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      throw new AppError('Invalid record ID', 400);
    }
    
    logDatabaseOperation('delete', 'datarecords', { id });
    
    // Build query with RBAC
    let query = { _id: id };
    if (req.user.role === 'user') {
      query.user = req.user.id;
    }
    
    // Find and delete record
    const record = await DataRecord.findOneAndDelete(query).lean();
    
    if (!record) {
      throw new NotFoundError('Record not found or access denied');
    }
    
    logUserAction('delete_record', req.user.id, {
      recordId: record._id,
      title: record.title
    });
    
    logPerformance('deleteRecord', Date.now() - startTime, { recordId: record._id });
    
    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
      data: record,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get statistics about data records
 * @route   GET /api/data/stats
 * @access  Private (Admin only)
 */
exports.getStats = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    // Only admin can access stats
    if (req.user.role !== 'admin') {
      throw new AuthorizationError('Admin access required');
    }
    
    logDatabaseOperation('stats', 'datarecords', {});
    
    // Get statistics in parallel
    const [
      totalRecords,
      userStats,
      recentActivity,
      recordsByMonth
    ] = await Promise.all([
      DataRecord.countDocuments(),
      DataRecord.aggregate([
        {
          $group: {
            _id: '$user',
            count: { $sum: 1 },
            lastRecord: { $max: '$createdAt' }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'userInfo'
          }
        },
        {
          $unwind: '$userInfo'
        },
        {
          $project: {
            username: '$userInfo.username',
            email: '$userInfo.email',
            count: 1,
            lastRecord: 1
          }
        },
        { $sort: { count: -1 } }
      ]),
      DataRecord.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } },
        { $limit: 7 }
      ]),
      DataRecord.aggregate([
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m',
                date: '$createdAt'
              }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);
    
    logPerformance('getStats', Date.now() - startTime);
    
    res.status(200).json({
      success: true,
      data: {
        totalRecords,
        userStats,
        recentActivity,
        recordsByMonth
      },
      meta: {
        timestamp: new Date().toISOString(),
        requestId: req.id
      }
    });
    
  } catch (error) {
    next(error);
  }
};
