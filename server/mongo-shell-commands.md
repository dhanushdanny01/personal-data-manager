# MongoDB Shell Commands

## Connect to MongoDB
Open Command Prompt and run:
```cmd
mongo
```

## Basic Commands
Once connected, run these commands:

### 1. Show Databases
```javascript
show dbs
```

### 2. Switch to Your Database
```javascript
use personal-data-manager
```

### 3. Show Collections
```javascript
show collections
```

### 4. Find All Records
```javascript
db.datarecords.find()
```

### 5. Find Specific Record
```javascript
db.datarecords.findOne({"title": "time for exam"})
```

### 6. Count Records
```javascript
db.datarecords.count()
```

### 7. Pretty Print Results
```javascript
db.datarecords.find().pretty()
```

## Exit MongoDB
```javascript
exit
```

## Your Current Data
- Database: personal-data-manager
- Collection: datarecords
- Records: 2 documents
- Field structure: {title, description, createdAt, updatedAt}
