/**
 * Test MongoDB Connection
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnection = async () => {
  console.log('🔍 Testing MongoDB connection...');
  console.log('📝 URI:', process.env.MONGODB_URI?.replace(/:([^@]+)@/, ':***@'));
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected successfully!');
    
    // Test database operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📊 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
  } catch (error) {
    console.error('❌ Connection failed:');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    if (error.code === 8000) {
      console.log('\n🎯 Solutions:');
      console.log('1. Check username/password in MongoDB Atlas');
      console.log('2. Verify database name: personal-data-manager');
      console.log('3. Check IP whitelist in Atlas Network Access');
      console.log('4. Try creating new user with simple password');
    }
  }
};

testConnection();
