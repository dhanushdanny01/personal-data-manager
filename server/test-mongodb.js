/**
 * MongoDB Connection Test
 * Run this script to test your MongoDB connection
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  try {
    console.log('Testing MongoDB connection...');
    console.log('Connection string:', process.env.MONGODB_URI);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Database:', conn.connection.name);
    console.log('Host:', conn.connection.host);
    console.log('Port:', conn.connection.port);
    
    // Test creating a simple record
    const TestRecord = new mongoose.Schema({
      title: String,
      description: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('TestRecord', TestRecord);
    
    const testDoc = await TestModel.create({
      title: 'Test Document',
      description: 'This is a test to verify MongoDB is working'
    });
    
    console.log('✅ Test document created:', testDoc._id);
    
    // Clean up
    await TestModel.deleteOne({ _id: testDoc._id });
    console.log('✅ Test document cleaned up');
    
    await mongoose.disconnect();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

testConnection();
