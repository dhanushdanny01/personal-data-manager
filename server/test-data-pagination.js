/**
 * Test Data Records Pagination
 * This demonstrates pagination with your actual data records
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DataRecord = require('./models/DataRecord');

const testDataPagination = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Test different pages and limits
    const testCases = [
      { page: 1, limit: 5 },
      { page: 2, limit: 5 },
      { page: 3, limit: 5 },
      { page: 1, limit: 10 },
      { page: 2, limit: 10 },
      { page: 1, limit: 3 }
    ];
    
    for (const testCase of testCases) {
      const { page, limit } = testCase;
      
      console.log(`\n--- Page ${page}, Limit ${limit} ---`);
      
      // Get total count
      const totalRecords = await DataRecord.countDocuments();
      
      // Apply pagination
      const records = await DataRecord.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
      
      console.log(`Found ${records.length} of ${totalRecords} records:`);
      
      records.forEach(record => {
        console.log(`📝 ${record.title} - ${record.description.substring(0, 30)}...`);
      });
      
      const totalPages = Math.ceil(totalRecords / limit);
      console.log(`📊 Page ${page}/${totalPages} | Total: ${totalRecords}`);
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testDataPagination();
