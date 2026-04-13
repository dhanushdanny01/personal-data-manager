/**
 * Check MongoDB Database Contents
 * Run this script to see all records in your database
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import the DataRecord model
const DataRecord = require('./models/DataRecord');

const checkDatabase = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Get all records
    const records = await DataRecord.find({});
    
    console.log(`\n📋 Found ${records.length} records in database:\n`);
    
    if (records.length === 0) {
      console.log('❌ No records found in database');
    } else {
      records.forEach((record, index) => {
        console.log(`\n--- Record ${index + 1} ---`);
        console.log(`🆔 ID: ${record._id}`);
        console.log(`📝 Title: ${record.title}`);
        console.log(`📄 Description: ${record.description}`);
        console.log(`📅 Created: ${record.createdAt}`);
        console.log(`🔄 Updated: ${record.updatedAt}`);
        console.log('------------------------');
      });
    }
    
    // Show database stats
    console.log(`\n📈 Database Statistics:`);
    console.log(`📊 Total Records: ${records.length}`);
    console.log(`🗄️  Database Name: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

checkDatabase();
