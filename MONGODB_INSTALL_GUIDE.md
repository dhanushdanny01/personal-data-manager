# MongoDB Local Installation Guide

## Step 1: Download MongoDB
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - Version: 7.0.x (latest stable)
   - Platform: Windows
   - Package: msi
3. Click "Download"

## Step 2: Install MongoDB
1. Run the downloaded .msi file
2. Choose "Complete" installation type
3. **IMPORTANT**: Check "Install MongoDB as a Service"
4. Check "Install MongoDB Compass" (GUI tool)
5. Click "Install"

## Step 3: Start MongoDB Service
### Option A: Using Services (Recommended)
1. Press `Windows + R`
2. Type `services.msc` and press Enter
3. Find "MongoDB" in the list
4. Right-click → "Start"

### Option B: Using Command Line
```cmd
net start MongoDB
```

## Step 4: Verify Installation
Open Command Prompt and run:
```cmd
mongod --version
```

You should see MongoDB version information.

## Step 5: Test Connection
After installation, run our test script:
```cmd
cd c:\persodm\server
node test-mongodb.js
```

## Step 6: Start Your App
Once MongoDB is running:
```cmd
cd c:\persodm\server
npm start
```

Your app will now use real MongoDB instead of memory storage!

## Troubleshooting
- If MongoDB doesn't start as service, run it manually:
  ```cmd
  mongod --dbpath "C:\Program Files\MongoDB\Server\7.0\data"
  ```
- Check Windows Event Viewer for error details
- Make sure port 27017 is not blocked by firewall
