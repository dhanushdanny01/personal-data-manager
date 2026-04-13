/**
 * In-Memory Database Configuration (for testing without MongoDB)
 * 
 * This is a temporary solution to run the app without MongoDB.
 * It uses an in-memory array to store data.
 * 
 * Data Flow: 
 * Application -> Memory Database -> In-Memory Storage
 */

let records = [];
let nextId = 1;

// Mock Mongoose methods
const mockModel = {
  find: async (query = {}) => {
    let result = [...records];
    
    // Handle search query
    if (query.title && query.title.$regex) {
      const searchTerm = query.title.$regex;
      const options = query.title.$options || '';
      const isCaseInsensitive = options.includes('i');
      
      result = result.filter(record => {
        if (isCaseInsensitive) {
          return record.title.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return record.title.includes(searchTerm);
      });
    }
    
    // Sort by createdAt descending
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return result;
  },
  
  create: async (data) => {
    const newRecord = {
      _id: nextId.toString(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    records.push(newRecord);
    nextId++;
    return newRecord;
  },
  
  findByIdAndUpdate: async (id, data, options = {}) => {
    const index = records.findIndex(r => r._id === id);
    if (index === -1) return null;
    
    records[index] = {
      ...records[index],
      ...data,
      updatedAt: new Date()
    };
    
    return options.new ? records[index] : records[index];
  },
  
  findByIdAndDelete: async (id) => {
    const index = records.findIndex(r => r._id === id);
    if (index === -1) return null;
    
    const deleted = records.splice(index, 1)[0];
    return deleted;
  }
};

// Mock connection function
const connectDB = async () => {
  console.log('Using in-memory database (for testing)');
  console.log('MongoDB connection skipped - using memory storage');
};

module.exports = { connectDB, mockModel };
