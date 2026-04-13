/**
 * Data Controller (Memory Version)
 * 
 * This is a temporary controller that uses in-memory storage
 * instead of MongoDB for testing purposes.
 * 
 * API Flow:
 * Route -> Controller -> Memory Storage
 * Route <- Controller <- Memory Storage
 */

const { mockModel } = require('../config/database-memory');

/**
 * @desc    Get all data records
 * @route   GET /api/data
 * @access  Public
 */
exports.getAllRecords = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    const records = await mockModel.find(query);
    
    res.status(200).json({
      success: true,
      count: records.length,
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
 * @desc    Create a new data record
 * @route   POST /api/data
 * @access  Public
 */
exports.createRecord = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description'
      });
    }
    
    // Basic validation
    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 100 characters'
      });
    }
    
    if (description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters'
      });
    }
    
    const record = await mockModel.create({
      title: title.trim(),
      description: description.trim()
    });
    
    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating record',
      error: error.message
    });
  }
};

/**
 * @desc    Update a data record
 * @route   PUT /api/data/:id
 * @access  Public
 */
exports.updateRecord = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and description'
      });
    }
    
    // Basic validation
    if (title.trim().length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title cannot exceed 100 characters'
      });
    }
    
    if (description.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description cannot exceed 500 characters'
      });
    }
    
    const record = await mockModel.findByIdAndUpdate(
      req.params.id,
      { 
        title: title.trim(),
        description: description.trim()
      },
      { new: true }
    );
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating record',
      error: error.message
    });
  }
};

/**
 * @desc    Delete a data record
 * @route   DELETE /api/data/:id
 * @access  Public
 */
exports.deleteRecord = async (req, res) => {
  try {
    const record = await mockModel.findByIdAndDelete(req.params.id);
    
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Record deleted successfully',
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting record',
      error: error.message
    });
  }
};
