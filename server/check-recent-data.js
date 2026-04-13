/**
 * Check Recently Added Data
 * This script shows the most recently added records
 */

require('dotenv').config();
const mongoose = require('mongoose');
const DataRecord = require('./models/DataRecord');
const User = require('./models/User');

const checkRecentData = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Get most recent records (last 10)
    const recentRecords = await DataRecord.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username email');
    
    console.log(`\n📋 Last ${recentRecords.length} Recently Added Records:\n`);
    
    if (recentRecords.length === 0) {
      console.log('❌ No records found in database');
    } else {
      recentRecords.forEach((record, index) => {
        console.log(`--- Recent Record ${index + 1} ---`);
        console.log(`🆔 ID: ${record._id}`);
        console.log(`📝 Title: ${record.title}`);
        console.log(`📄 Description: ${record.description.substring(0, 50)}...`);
        console.log(`👤 Owner: ${record.user ? record.user.username : 'Unknown'} (${record.user ? record.user.email : 'No email'})`);
        console.log(`📅 Created: ${record.createdAt}`);
        console.log(`⏰ Time Ago: ${getTimeAgo(record.createdAt)}`);
        console.log('------------------------');
      });
    }
    
    // Show statistics
    const totalRecords = await DataRecord.countDocuments();
    const totalUsers = await User.countDocuments();
    
    console.log(`\n📈 Database Statistics:`);
    console.log(`👥 Total Users: ${totalUsers}`);
    console.log(`📊 Total Records: ${totalRecords}`);
    console.log(`🗄️  Database: personal-data-manager`);
    
    // Show records added in last 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent24h = await DataRecord.countDocuments({ createdAt: { $gte: yesterday } });
    
    console.log(`\n🕐 Records Added in Last 24 Hours: ${recent24h}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

/**
 * Calculate time ago from date
 * @param {Date} date - The date to calculate from
 * @returns {string} - Human readable time ago
 */
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  
  return "Just now";
}

checkRecentData();
