/**
 * Test Pagination Query
 * This script demonstrates how to use skip() and limit() for pagination
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const testPagination = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Pagination parameters
    const page = 1;  // Current page (1-based)
    const limit = 2; // Records per page
    
    console.log(`\n📄 Testing pagination: Page ${page}, Limit ${limit}`);
    
    // Method 1: Basic pagination
    console.log('\n--- Method 1: Basic Pagination ---');
    const users1 = await User.find()
      .skip((page - 1) * limit)
      .limit(limit);
    
    console.log(`Found ${users1.length} users:`);
    users1.forEach(user => {
      console.log(`👤 ${user.username} (${user.email})`);
    });
    
    // Method 2: With sorting
    console.log('\n--- Method 2: Pagination with Sorting ---');
    const users2 = await User.find()
      .sort({ createdAt: -1 })  // Sort by newest first
      .skip((page - 1) * limit)
      .limit(limit);
    
    console.log(`Found ${users2.length} users (sorted by newest):`);
    users2.forEach(user => {
      console.log(`👤 ${user.username} (${user.email}) - Created: ${user.createdAt}`);
    });
    
    // Method 3: With filtering and sorting
    console.log('\n--- Method 3: Pagination with Filtering ---');
    const users3 = await User.find({ email: { $regex: 'gmail', $options: 'i' } })
      .sort({ username: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    console.log(`Found ${users3.length} Gmail users:`);
    users3.forEach(user => {
      console.log(`👤 ${user.username} (${user.email})`);
    });
    
    // Method 4: Get total count for pagination info
    console.log('\n--- Method 4: With Total Count ---');
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);
    
    console.log(`📊 Pagination Info:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Total Pages: ${totalPages}`);
    console.log(`   Current Page: ${page}`);
    console.log(`   Limit: ${limit}`);
    console.log(`   Has Next: ${page < totalPages}`);
    console.log(`   Has Previous: ${page > 1}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testPagination();
