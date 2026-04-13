/**
 * Show All Database Data
 * This script displays users and their associated data records
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const DataRecord = require('./models/DataRecord');

const showAllData = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    console.log('📊 Database:', mongoose.connection.name);
    
    // Get all users
    const users = await User.find({});
    console.log(`\n👥 Found ${users.length} users:\n`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      users.forEach((user, index) => {
        console.log(`--- User ${index + 1} ---`);
        console.log(`🆔 ID: ${user._id}`);
        console.log(`👤 Username: ${user.username}`);
        console.log(`📧 Email: ${user.email}`);
        console.log(`📅 Created: ${user.createdAt}`);
        console.log('------------------------');
      });
    }
    
    // Get all data records with user info
    const records = await DataRecord.find({}).populate('user', 'username email');
    console.log(`\n📋 Found ${records.length} data records:\n`);
    
    if (records.length === 0) {
      console.log('❌ No data records found in database');
    } else {
      records.forEach((record, index) => {
        console.log(`--- Record ${index + 1} ---`);
        console.log(`🆔 ID: ${record._id}`);
        console.log(`📝 Title: ${record.title}`);
        console.log(`📄 Description: ${record.description}`);
        console.log(`👤 Owner: ${record.user ? record.user.username : 'Unknown'} (${record.user ? record.user.email : 'No email'})`);
        console.log(`👤 Owner ID: ${record.user ? record.user._id : 'No user'}`);
        console.log(`📅 Created: ${record.createdAt}`);
        console.log(`🔄 Updated: ${record.updatedAt}`);
        console.log('------------------------');
      });
    }
    
    // Show database stats
    console.log(`\n📈 Database Statistics:`);
    console.log(`👥 Total Users: ${users.length}`);
    console.log(`📊 Total Records: ${records.length}`);
    console.log(`🗄️  Database Name: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    
    // Show user-record mapping
    console.log(`\n🔗 User-Record Mapping:`);
    for (const user of users) {
      const userRecords = records.filter(record => record.user && record.user._id.toString() === user._id.toString());
      console.log(`👤 ${user.username}: ${userRecords.length} records`);
      userRecords.forEach(record => {
        console.log(`   📝 "${record.title}"`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

showAllData();
