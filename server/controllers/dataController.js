/**
 * Data Controller
 * 
 * This is the Controller layer in MVC pattern.
 * It handles the business logic and acts as an intermediary between
 * the routes (incoming requests) and the model (database operations).
 * 
 * API Flow:
 * Route -> Controller -> Model -> Database
 * Route <- Controller <- Model <- Database
 */

const DataRecord = require('../models/DataRecord');

/**
 * @desc    Get all data records with RBAC (Role-Based Access Control)
 * @route   GET /api/data
 * @access  Private
 */
exports.getAllRecords = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    // Convert to numbers and validate
    const pageNum = parseInt(page) > 0 ? parseInt(page) : 1;
    const limitNum = parseInt(limit) > 0 && parseInt(limit) <= 100 ? parseInt(limit) : 10;
    
    // Build query based on user role
    let query = {};
    
    // RBAC: Admin sees all records, User sees only their own
    if (req.user.role === 'user') {
      query.user = req.user.id; // Only return user's records
    }
    // Admin: no user filter (empty query) - sees all records
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    // Get total count of records based on role
    const totalRecords = await DataRecord.countDocuments(query);
    
    // Calculate pagination values
    const skip = (pageNum - 1) * limitNum;
    const totalPages = Math.ceil(totalRecords / limitNum);
    
    // Fetch records with pagination
    const records = await DataRecord.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.status(200).json({
      success: true,
      pagination: {
        currentPage: pageNum,
        limit: limitNum,
        totalRecords,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      },
      userRole: req.user.role, // Include role for frontend
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching records',
      error: error.message
    });
  }
};

/**
 * @desc    Create a new data record with RBAC
 * @route   POST /api/data
 * @access  Private
 */
exports.createRecord = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description'
      });
    }
    
    // Create record with user association
    const recordData = {
      title,
      description,
      user: req.user.id // Always associate with logged-in user
    };
    
    const record = await DataRecord.create(recordData);
    
    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      userRole: req.user.role,
      data: record
    });
  } catch (error) {
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating record',
      error: error.message
    });
  }
};

/**
 * @desc    Update a data record with RBAC security
 * @route   PUT /api/data/:id
 * @access  Private
 */
exports.updateRecord = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Basic validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description'
      });
    }
    
    // RBAC: Build query based on user role
    let query = { _id: req.params.id };
    
    if (req.user.role === 'user') {
      // Users can only update their own records
      query.user = req.user.id;
    }
    // Admin: no user filter - can update any record
    
    // Find and update record
    const record = await DataRecord.findOneAndUpdate(
      query,
      { title, description },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validation on update
      }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: req.user.role === 'user' 
          ? 'Record not found or access denied' 
          : 'Record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Record updated successfully',
      userRole: req.user.role,
      data: record
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error updating record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a data record with RBAC security
 * @route   DELETE /api/data/:id
 * @access  Private
 */
exports.deleteRecord = async (req, res) => {
  try {
    // RBAC: Build query based on user role
    let query = { _id: req.params.id };
    
    if (req.user.role === 'user') {
      // Users can only delete their own records
      query.user = req.user.id;
    }
    // Admin: no user filter - can delete any record
    
    // Find and delete record
    const record = await DataRecord.findOneAndDelete(query);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: req.user.role === 'user' 
          ? 'Record not found or access denied' 
          : 'Record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
      userRole: req.user.role,
      data: record
    });
  } catch (error) {
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid record ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error deleting record',
      error: error.message
    });
  }
};
