/**
 * Data Record Model
 * 
 * This is the Model layer in MVC pattern.
 * It defines the schema and structure of our data records in MongoDB.
 * 
 * Data Flow:
 * Controller -> Model -> MongoDB
 * Controller <- Model <- MongoDB
 */

const mongoose = require('mongoose');

const dataRecordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  // Add user association
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Add index for better search performance on title field
dataRecordSchema.index({ title: 'text' });

module.exports = mongoose.model('DataRecord', dataRecordSchema);
