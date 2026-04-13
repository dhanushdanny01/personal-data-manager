/**
 * Data Routes
 * 
 * This is the Route layer in MVC pattern.
 * It defines the API endpoints and maps them to controller functions.
 * 
 * API Flow:
 * Client Request -> Route -> Controller -> Model -> Database
 * Client Response <- Route <- Controller <- Model <- Database
 */

const express = require('express');
const router = express.Router();
const {
  getAllRecords,
  createRecord,
  updateRecord,
  deleteRecord
} = require('../controllers/dataController');

/**
 * @route   GET /api/data
 * @desc    Get all data records (with optional search)
 * @access  Public
 */
router.get('/', getAllRecords);

/**
 * @route   POST /api/data
 * @desc    Create a new data record
 * @access  Public
 */
router.post('/', createRecord);

/**
 * @route   PUT /api/data/:id
 * @desc    Update a data record
 * @access  Public
 */
router.put('/:id', updateRecord);

/**
 * @route   DELETE /api/data/:id
 * @desc    Delete a data record
 * @access  Public
 */
router.delete('/:id', deleteRecord);

module.exports = router;
