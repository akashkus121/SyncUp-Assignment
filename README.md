# Real-time Coaching Feed Application

A full-stack real-time application built with Node.js, Express, Next.js, MongoDB, Redis, and Socket.IO.

## 🎯 Features

### Backend
- ✅ RESTful APIs (GET /feed, POST /feed, PUT /feed/:id, DELETE /feed/:id)
- ✅ MongoDB for persistent data storage
- ✅ Redis caching with TTL for GET /feed endpoint
- ✅ Socket.IO for real-time updates
- ✅ Deduplication logic to prevent duplicate socket events
- ✅ Automatic reconnection handling
- ✅ Connection state recovery
- ✅ Health check endpoints
- ✅ CORS support for frontend integration

### Frontend
- ✅ Next.js for server-side rendering and optimization
- ✅ Real-time feed updates without page refresh
- ✅ Home page to display all feeds with live updates
- ✅ Admin page to add new feeds
- ✅ Loading states and error handling
- ✅ Connection status indicator
- ✅ Responsive design
- ✅ Beautiful UI with animations

## 📋 Project Structure

```
d:\SYNC\
├── Backend/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── redis.js       # Redis cache setup
│   ├── models/
│   │   └── Feed.js        # Feed schema
│   ├── routes/
│   │   └── feed.js        # Feed API routes
│   ├── socket.js          # Socket.IO setup
│   ├── server.js          # Express server
│   ├── package.json
│   ├── .env
│   └── node_modules/
│
└── Frontend/
    ├── pages/
    │   ├── _app.js        # App wrapper
    │   ├── _document.js   # HTML structure
    │   ├── index.js       # Home page
    │   └── admin.js       # Admin page
    ├── components/
    │   ├── FeedList.js    # Display feeds
    │   └── FeedForm.js    # Add feed form
    ├── utils/
    │   ├── socket.js      # Socket.IO client
    │   └── api.js         # API calls
    ├── styles/
    │   ├── globals.css
    │   ├── Home.module.css
    │   ├── Admin.module.css
    │   ├── FeedList.module.css
    │   └── FeedForm.module.css
    ├── package.json
    ├── next.config.js
    ├── .env.local
    └── node_modules/
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- MongoDB (local or Atlas)
- Redis (using Upstash Redis or local instance)
- npm or yarn

### Backend Setup

1. Navigate to the Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env` with your credentials:
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

4. Start the backend server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the Frontend folder:
```bash
cd Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Update `.env.local` with your backend URL:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### GET /api/feed
Fetch all feeds (cached for 60 seconds)

**Response:**
```json
{
  "success": true,
  "source": "cache|database",
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "The Power of Consistency",
      "content": "Consistency is the key to success...",
      "author": "Coach John",
      "category": "motivation",
      "tags": ["fitness", "mindset"],
      "likes": 15,
      "isPinned": true,
      "createdAt": "2024-01-20T10:00:00Z",
      "updatedAt": "2024-01-20T10:00:00Z"
    }
  ]
}
```

### POST /api/feed
Create a new feed (invalidates cache and broadcasts via WebSocket)

**Request Body:**
```json
{
  "title": "string (required, max 200 chars)",
  "content": "string (required, max 2000 chars)",
  "author": "string (required, max 100 chars)",
  "category": "motivation|technique|nutrition|mindset|performance|recovery",
  "tags": ["string"],
  "isPinned": false
}
```

### PUT /api/feed/:id
Update an existing feed

### DELETE /api/feed/:id
Delete a feed

### GET /health
Check backend health status

## 🔌 WebSocket Events

### Server to Client
- `connected` - Connection established
- `new_feed` - New feed published (real-time)
- `delete_feed` - Feed deleted (real-time)

### Client to Server
- `join_feed` - Join the feed room
- `ping_server` - Check connection health

## 🎨 Frontend Pages

### Home Page (`/`)
- Displays all feeds in a grid/list layout
- Shows real-time updates as new feeds are published
- Displays connection status
- Shows loading and error states
- Responsive design

### Admin Page (`/admin`)
- Form to create new feeds
- Form validation
- Real-time feed preview
- Success/error notifications
- Character counters
- Category selection
- Tag input

## 🔄 Real-time Features

### Socket.IO Connection Recovery
- Automatic reconnection with exponential backoff
- Connection state recovery (up to 2 minutes)
- Duplicate event prevention via eventId tracking

### Cache Strategy
- GET /feed responses cached for 60 seconds
- Cache invalidated on POST/PUT/DELETE operations
- Cache miss prompts MongoDB query

### Deduplication
- Server-side: Tracks eventIds per socket connection
- Client-side: Each event has unique eventId
- Prevents duplicate feed insertions

## 🐛 Debugging

### Backend Logs
- MongoDB connection status
- Redis cache hit/miss
- Socket.IO connections
- API request/response
- Error tracking

### Frontend Logs
- Socket connection status
- API call logs
- Real-time update notifications
- Form validation errors

## 🚀 Bonus Features Implemented

✅ **Automatic Reconnects**
- Socket.IO reconnection with exponential backoff
- Connection state recovery for 2 minutes

✅ **Duplicate Prevention**
- EventId-based deduplication on server
- EventId-based deduplication on client

✅ **Loading/Error Handling**
- Loading spinners on data fetch
- Error alerts with helpful messages
- Connection status indicator
- Form validation

## 📊 Scalability Considerations

1. **Database**: Indexed queries on createdAt, category, isPinned
2. **Caching**: Redis cache layer for frequently accessed data
3. **WebSockets**: Socket.IO with connection state recovery
4. **Database Queries**: Lean queries, field selection
5. **Load Balancing**: Ready for horizontal scaling
6. **Session Recovery**: Built-in mechanism for client reconnects

## 🔐 Environment Variables

### Backend
- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS
- `UPSTASH_REDIS_REST_URL` - Redis REST endpoint
- `UPSTASH_REDIS_REST_TOKEN` - Redis authentication token

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.IO server URL

## 📝 Code Quality

- Clean, modular code structure
- Clear separation of concerns
- Comprehensive error handling
- Proper logging for debugging
- Responsive and accessible UI
- Browser console logs for development

## 🎓 Learning Outcomes

This project demonstrates:
- RESTful API design
- Real-time communication with WebSockets
- Cache management and invalidation
- Database indexing and optimization
- Frontend state management
- Error handling and resilience
- Responsive UI design
- Full-stack integration

## 📄 License

ISC

## 👨‍💼 Support

For issues or questions, please refer to the README and code comments.
#
