/**
 * Create Admin User for RBAC Testing
 * This script creates an admin user to test role-based access control
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const createAdminUser = async () => {
  try {
    console.log('🔍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB!');
    
    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@example.com' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👑 Role: ${existingAdmin.role}`);
      await mongoose.disconnect();
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`👤 Username: ${adminUser.username}`);
    console.log(`📧 Email: ${adminUser.email}`);
    console.log(`👑 Role: ${adminUser.role}`);
    console.log(`🔑 Password: admin123`);
    
    console.log('\n🎯 You can now login with admin credentials to test RBAC!');
    console.log('📋 Admin will see ALL records from all users');
    console.log('🛡️ Regular users will only see their own records');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

createAdminUser();
