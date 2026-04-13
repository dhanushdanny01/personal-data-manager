# MongoDB Setup Instructions

## Option 1: Install MongoDB Community Server (Recommended)

### Windows Installation:
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Select Windows version and download the MSI installer
3. Run the installer with "Complete" setup
4. Install MongoDB Compass (GUI tool) - optional but helpful
5. During installation, choose "Install MongoDB as a Service"

### Start MongoDB Service:
After installation:
1. Open Services (Windows + R, type "services.msc")
2. Find "MongoDB" service
3. Right-click and "Start"

### Verify Installation:
Open Command Prompt and run:
```
mongod --version
```

## Option 2: Use MongoDB Atlas (Cloud - Easier)

### Steps:
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a new cluster (free tier)
4. Create a database user
5. Get your connection string
6. Update the .env file with your Atlas connection string

### Example Atlas Connection String:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/personal-data-manager?retryWrites=true&w=majority
```

## After MongoDB Setup:

1. Update server/.env file with your MongoDB connection string
2. Restart the server
3. Your app will now use real MongoDB instead of memory storage!
