#!/usr/bin/env node

/**
 * Production Build Script
 * 
 * This script prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Starting production build process...');

// Check if we're in the right directory
if (!fs.existsSync('./server') || !fs.existsSync('./client')) {
  console.error('❌ Error: Run this script from the project root directory');
  process.exit(1);
}

// Check for required environment variables
const requiredEnvVars = ['NODE_ENV', 'MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  console.error('\nPlease set these environment variables and try again.');
  process.exit(1);
}

console.log('✅ Environment variables validated');

// Install backend dependencies
console.log('📦 Installing backend dependencies...');
try {
  execSync('cd server && npm ci --production', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install backend dependencies');
  process.exit(1);
}

// Install frontend dependencies
console.log('📦 Installing frontend dependencies...');
try {
  execSync('cd client && npm ci', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to install frontend dependencies');
  process.exit(1);
}

// Build frontend
console.log('🏗️ Building frontend for production...');
try {
  execSync('cd client && npm run build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Failed to build frontend');
  process.exit(1);
}

// Create production-ready directory structure
console.log('📁 Creating production directory structure...');
const prodDir = './dist';

if (fs.existsSync(prodDir)) {
  fs.rmSync(prodDir, { recursive: true });
}

fs.mkdirSync(prodDir, { recursive: true });

// Copy backend files
console.log('📋 Copying backend files...');
const backendFiles = [
  'server/enhancedServer.js',
  'server/package.json',
  'server/package-lock.json',
  'server/.env.production'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const dest = path.join(prodDir, path.basename(file));
    fs.copyFileSync(file, dest);
    console.log(`   ✅ Copied ${file}`);
  } else {
    console.warn(`   ⚠️  File not found: ${file}`);
  }
});

// Copy backend directories
const backendDirs = [
  'server/config',
  'server/controllers',
  'server/middleware',
  'server/models',
  'server/routes',
  'server/validators'
];

backendDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const dest = path.join(prodDir, path.basename(dir));
    copyDirectory(dir, dest);
    console.log(`   ✅ Copied ${dir}/`);
  }
});

// Copy frontend build
console.log('📋 Copying frontend build...');
const clientBuildDir = './client/build';
if (fs.existsSync(clientBuildDir)) {
  copyDirectory(clientBuildDir, path.join(prodDir, 'public'));
  console.log('   ✅ Copied frontend build to public/');
} else {
  console.error('❌ Frontend build not found');
  process.exit(1);
}

// Create production start script
const startScript = `#!/bin/bash
echo "🚀 Starting Personal Data Manager in production mode..."
export NODE_ENV=production
export PORT=\${PORT:-5002}
node enhancedServer.js
`;

fs.writeFileSync(path.join(prodDir, 'start.sh'), startScript);
fs.chmodSync(path.join(prodDir, 'start.sh'), '755');

// Create production package.json
const prodPackageJson = {
  name: 'personal-data-manager-production',
  version: '2.0.0',
  description: 'Production build of Personal Data Manager',
  main: 'enhancedServer.js',
  scripts: {
    start: './start.sh',
    'start:direct': 'NODE_ENV=production node enhancedServer.js'
  },
  engines: {
    node: '>=16.0.0',
    npm: '>=8.0.0'
  }
};

fs.writeFileSync(
  path.join(prodDir, 'package.json'),
  JSON.stringify(prodPackageJson, null, 2)
);

// Create .env template
const envTemplate = `# Production Environment Variables Template
# Copy this file to .env and fill in your values

NODE_ENV=production
PORT=5002

# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# JWT
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters
JWT_EXPIRES_IN=24h

# CORS
ALLOWED_ORIGINS=https://yourdomain.com

# Rate Limiting
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=info
LOG_FILE_ENABLED=true
`;

fs.writeFileSync(path.join(prodDir, '.env.template'), envTemplate);

console.log('✅ Production build completed!');
console.log(`📁 Production files are in: ${prodDir}/`);
console.log('\n📋 Next steps:');
console.log('1. Deploy the contents of ./dist/ to your hosting platform');
console.log('2. Set up your environment variables');
console.log('3. Configure your domain and SSL');
console.log('4. Test the deployment');

// Helper function to copy directories recursively
function copyDirectory(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
}
