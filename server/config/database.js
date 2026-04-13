/**
 * Database Configuration
 * 
 * This layer handles the connection to MongoDB using Mongoose.
 * It's responsible for establishing and managing the database connection.
 * 
 * Data Flow: 
 * Application -> Database Config -> MongoDB
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
