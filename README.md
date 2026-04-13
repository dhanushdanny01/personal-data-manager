# Personal Data Manager

A full-stack CRUD application built with React, Node.js, Express, and MongoDB. This application demonstrates clean architecture with clear separation of concerns and follows the MVC pattern.

## 🏗️ Architecture Overview

### Backend (Node.js + Express + MongoDB)
- **MVC Pattern Implementation:**
  - **Models**: Define data structure and database operations (`server/models/`)
  - **Views**: Not applicable (API returns JSON)
  - **Controllers**: Handle business logic (`server/controllers/`)
  - **Routes**: Define API endpoints (`server/routes/`)

### Frontend (React)
- **Component-Based Architecture:**
  - **App.js**: Main component managing global state
  - **Components**: Reusable UI components (`client/src/components/`)
  - **Hooks**: State management with React hooks

### Data Flow
```
User Interface → React Component → API Call → Express Route → Controller → Model → MongoDB
User Interface ← React Component ← API Response ← Express Route ← Controller ← Model ← MongoDB
```

## 🚀 Tech Stack

### Frontend
- **React 18.2.0** - UI library with functional components and hooks
- **Axios** - HTTP client for API calls
- **CSS3** - Modern styling with responsive design

### Backend
- **Node.js** - JavaScript runtime
- **Express 4.18.2** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose 7.5.0** - MongoDB object modeling

## 📋 Features

1. **Create Records** - Add new data records with title and description
2. **Read Records** - View all records in a responsive grid layout
3. **Update Records** - Edit existing records
4. **Delete Records** - Remove records with confirmation
5. **Search/Filter** - Search records by title with debounced input
6. **Loading States** - Visual feedback during API operations
7. **Form Validation** - Client-side and server-side validation
8. **Error Handling** - Comprehensive error handling throughout the application
9. **Responsive Design** - Mobile-friendly interface

## 📁 Project Structure

```
personal-data-manager/
├── client/                     # React frontend
│   ├── public/
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── DataForm.js    # Form for create/edit
│   │   │   ├── DataList.js    # List display component
│   │   │   └── SearchBar.js   # Search functionality
│   │   ├── App.js             # Main App component
│   │   ├── App.css            # Main styles
│   │   ├── index.js           # Entry point
│   │   └── index.css          # Global styles
│   └── package.json           # Frontend dependencies
├── server/                     # Node.js backend
│   ├── config/
│   │   └── database.js        # Database configuration
│   ├── controllers/
│   │   └── dataController.js  # Business logic
│   ├── models/
│   │   └── DataRecord.js      # Mongoose model
│   ├── routes/
│   │   └── dataRoutes.js      # API routes
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables
│   └── package.json           # Backend dependencies
└── README.md                  # This file
```

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (installed and running locally)
- **npm** or **yarn**

### 1. Clone or Setup the Project
If you have the files, navigate to the project directory:
```bash
cd personal-data-manager
```

### 2. Backend Setup

#### Navigate to server directory:
```bash
cd server
```

#### Install dependencies:
```bash
npm install
```

#### Environment Configuration:
The `.env` file is already configured for local MongoDB:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/personal-data-manager
```

If your MongoDB is running on a different port or host, update the `MONGODB_URI` accordingly.

#### Start the backend server:
```bash
# For development (with auto-restart)
npm run dev

# Or for production
npm start
```

The backend server will start on `http://localhost:5000`

### 3. Frontend Setup

#### Navigate to client directory (from project root):
```bash
cd client
```

#### Install dependencies:
```bash
npm install
```

#### Start the React development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000` and automatically open in your browser.

## 🌐 API Endpoints

### Data Records API
- **GET** `/api/data` - Get all records (supports `?search=` query parameter)
- **POST** `/api/data` - Create a new record
- **PUT** `/api/data/:id` - Update an existing record
- **DELETE** `/api/data/:id` - Delete a record

### Health Check
- **GET** `/health` - Server health status

### Request/Response Examples

#### Create Record
```bash
POST /api/data
Content-Type: application/json

{
  "title": "Sample Title",
  "description": "Sample description text"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "_id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "title": "Sample Title",
    "description": "Sample description text",
    "createdAt": "2023-09-06T12:00:00.000Z",
    "updatedAt": "2023-09-06T12:00:00.000Z",
    "__v": 0
  }
}
```

## 🧪 Testing the Application

### Manual Testing
1. **Create a Record:**
   - Fill out the form with title and description
   - Click "Add Record"
   - Verify the record appears in the list

2. **Search Functionality:**
   - Type in the search bar
   - Verify results filter by title
   - Test debounced search (wait 300ms)

3. **Edit a Record:**
   - Click the edit button (✏️) on any record
   - Modify the title/description
   - Click "Update Record"
   - Verify changes are saved

4. **Delete a Record:**
   - Click the delete button (🗑️) on any record
   - Confirm the deletion
   - Verify the record is removed

### API Testing with curl
```bash
# Get all records
curl http://localhost:5000/api/data

# Create a record
curl -X POST http://localhost:5000/api/data \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Title","description":"Test Description"}'

# Update a record (replace ID)
curl -X PUT http://localhost:5000/api/data/64f8a1b2c3d4e5f6a7b8c9d0 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","description":"Updated Description"}'

# Delete a record (replace ID)
curl -X DELETE http://localhost:5000/api/data/64f8a1b2c3d4e5f6a7b8c9d0
```

## 🔧 Development Notes

### Code Architecture Principles
1. **Separation of Concerns:** Each layer has a specific responsibility
2. **DRY Principle:** Reusable components and functions
3. **Error Handling:** Comprehensive error handling at all levels
4. **Validation:** Both client-side and server-side validation
5. **Responsive Design:** Mobile-first approach

### Key Features Explained

#### MVC Pattern in Backend
- **Model (`DataRecord.js`)**: Defines the schema and database operations
- **Controller (`dataController.js`)**: Contains business logic and handles requests
- **Routes (`dataRoutes.js`)**: Maps HTTP methods to controller functions

#### React Component Architecture
- **App.js**: Main component managing global state and API calls
- **DataForm.js**: Handles form validation and submission
- **DataList.js**: Displays records with edit/delete functionality
- **SearchBar.js**: Implements debounced search functionality

#### State Management
- React hooks (`useState`, `useEffect`) for local state
- Props for component communication
- Axios for HTTP requests with error handling

## 🚀 Deployment Considerations

### Production Environment Variables
```bash
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://your-production-db-url
```

### Build Process
```bash
# Build React app for production
cd client
npm run build

# The build files will be in client/build/
```

## 🤝 Contributing

1. Follow the existing code structure and patterns
2. Add comments explaining complex logic
3. Ensure proper error handling
4. Test all functionality before submitting changes

## 📝 License

This project is for educational purposes to demonstrate full-stack development concepts.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check the connection string in `.env`
   - Verify MongoDB is accessible on the specified port

2. **Port Already in Use:**
   - Change the PORT in `.env` file
   - Kill the process using the port

3. **CORS Issues:**
   - The backend includes CORS middleware
   - Ensure frontend is running on `localhost:3000`

4. **Dependencies Not Found:**
   - Run `npm install` in both `client` and `server` directories
   - Clear npm cache: `npm cache clean --force`

### Debug Mode
For detailed error messages, set:
```bash
NODE_ENV=development
```

## 📚 Learning Outcomes

This project demonstrates:
- Full-stack development with MERN stack
- RESTful API design and implementation
- MVC architectural pattern
- React functional components and hooks
- State management in React
- Form validation and error handling
- Responsive web design
- Database modeling with Mongoose
- API integration with Axios
- Modern JavaScript (ES6+) features
