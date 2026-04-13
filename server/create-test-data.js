/**
 * Create Test Data for Pagination Demo
 * This script creates multiple records to test pagination functionality
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DataRecord = require('./models/DataRecord');

const createTestData = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Get the first user (or create one if none exists)
    let user = await User.findOne({});
    if (!user) {
      console.log('👤 Creating test user...');
      user = await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Test user created');
    }
    
    console.log(`👤 Using user: ${user.username}`);
    
    // Clear existing records for this user
    await DataRecord.deleteMany({ user: user._id });
    console.log('🗑️  Cleared existing test records');
    
    // Create test records
    const testRecords = [];
    for (let i = 1; i <= 25; i++) {
      testRecords.push({
        title: `Test Record ${i}`,
        description: `This is the description for test record number ${i}. Created to demonstrate pagination functionality.`,
        user: user._id
      });
    }
    
    console.log('📝 Creating test records...');
    const createdRecords = await DataRecord.insertMany(testRecords);
    
    console.log(`✅ Created ${createdRecords.length} test records`);
    console.log('🎯 Pagination is now ready for testing!');
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

createTestData();
