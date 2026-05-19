# Architecture Documentation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                        │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  Home Page       │  │  Admin Page                      │ │
│  │ - Display feeds  │  │ - Create/Edit feeds              │ │
│  │ - Live updates   │  │ - Form validation                │ │
│  │ - Connection     │  │ - Pin/Category selection         │ │
│  │   status         │  │ - Real-time feedback             │ │
│  └──────────────────┘  └──────────────────────────────────┘ │
│          ▲                          ▲                         │
│          │ WebSocket (Socket.IO)    │ REST API (axios)      │
│          │                          │                       │
└──────────┼──────────────────────────┼─────────────────────────┘
           │                          │
           ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Express.js)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Socket.IO Server                           │  │
│  │  - Handle client connections                         │  │
│  │  - Broadcast new feeds (new_feed event)              │  │
│  │  - Broadcast deletions (delete_feed event)           │  │
│  │  - Connection state recovery                         │  │
│  │  - Deduplication via eventId tracking                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▲                                  │
│                          │                                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │        Express Routes (/api/feed)                    │  │
│  │  ┌────────────────┐  ┌─────────────────────────────┐│  │
│  │  │ GET /feed      │  │ POST /feed                  ││  │
│  │  │ - Check Redis  │  │ - Validate input            ││  │
│  │  │ - If miss, get │  │ - Save to MongoDB           ││  │
│  │  │   from DB      │  │ - Invalidate cache          ││  │
│  │  │ - Cache result │  │ - Broadcast via Socket.IO   ││  │
│  │  │ - Return       │  │ - Return created feed       ││  │
│  │  └────────────────┘  └─────────────────────────────┘│  │
│  │  ┌────────────────┐  ┌─────────────────────────────┐│  │
│  │  │ PUT /feed/:id  │  │ DELETE /feed/:id            ││  │
│  │  │ - Update doc   │  │ - Delete from DB            ││  │
│  │  │ - Invalidate   │  │ - Invalidate cache          ││  │
│  │  │   cache        │  │ - Broadcast deletion        ││  │
│  │  └────────────────┘  └─────────────────────────────┘│  │
│  └──────────────────────────────────────────────────────┘  │
│                          ▲                                  │
│                          │                                  │
│  ┌──────────────────┐  ┌─────────────────────────────────┐ │
│  │ Redis Cache      │  │ MongoDB Database              │ │
│  │ - TTL: 60s       │  │ - Feed collection             │ │
│  │ - Key: all_feeds │  │ - Indexed on createdAt,       │ │
│  │ - JSON value     │  │   category, isPinned          │ │
│  │ - Hit on GET     │  │ - Timestamps auto-added       │ │
│  │ - Invalidated    │  │ - Validation rules enforced   │ │
│  │   on POST/PUT/   │  │                               │ │
│  │   DELETE         │  │                               │ │
│  └──────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Fetching Feeds (GET /api/feed)

```
Browser Request (Home Page)
    │
    ▼
Frontend axios call
    │
    ▼
Express GET /api/feed
    │
    ├─ Check Redis cache (key: "all_feeds")
    │
    ├─ CACHE HIT: Return cached JSON + source: "cache"
    │
    └─ CACHE MISS:
       ├─ Query MongoDB for all feeds
       ├─ Sort by isPinned (desc), createdAt (desc)
       ├─ Select fields (exclude __v)
       ├─ Use lean() for raw JSON
       ├─ Cache result in Redis (TTL: 60s)
       └─ Return JSON + source: "database"
    │
    ▼
Frontend receives feeds
    │
    ├─ Update state with feed array
    ├─ Render FeedList component
    └─ Show source (cache/database)
```

### 2. Creating New Feed (POST /api/feed)

```
Admin Form Submit
    │
    ▼
Validate form locally (title, content, author)
    │
    ▼
Frontend axios POST request
    │
    ▼
Express POST /api/feed
    │
    ├─ Validate request body
    ├─ Create new Feed document
    ├─ Save to MongoDB (auto timestamps)
    │
    ├─ Invalidate Redis cache (del "all_feeds")
    │
    ├─ Get Socket.IO io instance
    ├─ Broadcast new_feed event
    │  └─ Event includes: eventId, feed, timestamp
    │
    └─ Return 201 + created feed
    │
    ▼
Socket.IO broadcasts to all connected clients
    │
    ├─ Client receives "new_feed" event
    ├─ Check for duplicate (by _id)
    ├─ Update local feed array
    ├─ Re-render FeedList
    └─ Show toast notification
    │
    ▼
Admin page shows success message
All other pages instantly show new feed
```

### 3. Real-time Updates (Socket.IO)

```
Browser 1 (Admin):
    Publishes new feed
         │
         ▼
    POST /api/feed
         │
         ▼
    Server broadcasts "new_feed"
         │
         ├────────────────────────┬────────────────────────┐
         │                        │                        │
         ▼                        ▼                        ▼
   Browser 1              Browser 2 (Home)         Browser 3 (Admin)
   (Admin Page)           Receives event           Receives event
   │                      │                        │
   ├─ Update UI           ├─ Update feeds array    ├─ Update feeds array
   └─ Close form          └─ Re-render page        └─ Show in list
                                 │
                                 ▼
                          Users see new feed
                          without refresh!
```

## Technical Decisions

### 1. Redis Caching Strategy

**Why Cache?**
- MongoDB queries can be slow with large datasets
- GET /feed is the most frequently accessed endpoint
- 60-second TTL balances freshness with performance

**How It Works:**
- All feeds cached as JSON string under key "all_feeds"
- TTL set to 60 seconds
- Invalidated on any POST/PUT/DELETE to ensure freshness
- Miss on first request or after invalidation
- Hit for subsequent requests within TTL

**Cache Invalidation:**
```
POST /api/feed  → cacheDel("all_feeds")
PUT /api/feed   → cacheDel("all_feeds")
DELETE /api/feed → cacheDel("all_feeds")
```

### 2. Socket.IO Deduplication

**Problem:** Multiple socket connections can cause duplicate events

**Solution:** EventId tracking per socket connection
- Server tracks eventIds on each socket
- Maintains sliding window of 50 recent eventIds
- Duplicate eventId returns early without processing
- Client also sends eventId to help with tracking

```javascript
// Server-side
const recentEventIds = [];
const isDuplicate = (eventId) => {
  if (recentEventIds.includes(eventId)) return true;
  recentEventIds.push(eventId);
  if (recentEventIds.length > MAX_TRACKED_EVENTS) {
    recentEventIds.shift();
  }
  return false;
};
```

### 3. Connection State Recovery

**Socket.IO Config:**
```javascript
connectionStateRecovery: {
  maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
  skipMiddlewares: true,
}
```

**Benefits:**
- Automatic reconnection on network loss
- Exponential backoff to prevent server overload
- Recovery buffer of 2 minutes for client messages
- Transparent to application code

### 4. Database Indexing

**Indexes created for efficient queries:**
```javascript
feedSchema.index({ createdAt: -1 });           // For sorting by date
feedSchema.index({ category: 1, createdAt: -1 }); // For category filtering
feedSchema.index({ isPinned: -1, createdAt: -1 }); // For pinned feeds first
```

### 5. CORS Configuration

**Security:**
- Only accepts requests from specified CORS_ORIGIN
- Credentials support enabled for auth-aware future additions
- No wildcard CORS (specific origin required)

```javascript
cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
})
```

## Performance Optimization

### Frontend
- **Code Splitting**: Next.js automatic route-based splitting
- **Image Optimization**: Ready for next/image integration
- **CSS Modules**: Scoped styles prevent conflicts
- **Lazy Loading**: Components load on demand
- **Animations**: GPU-accelerated CSS animations

### Backend
- **Lean Queries**: MongoDB lean() for raw JSON objects
- **Field Selection**: Only select needed fields
- **Connection Pooling**: Mongoose handles connection pool
- **Helmet**: Security headers included
- **Compression**: Ready for middleware compression

## Scalability Considerations

### Horizontal Scaling
- Stateless backend servers (except Socket.IO)
- Redis for session/cache across servers
- Socket.IO adapter for multi-server support (Redis adapter available)
- MongoDB replica sets for high availability

### Database
- MongoDB Atlas auto-scaling
- Connection pooling managed by Mongoose
- Indexes prevent full collection scans
- Lean queries reduce memory overhead

### Caching
- Redis cache layer
- Cache invalidation ensures consistency
- TTL prevents stale data

## Error Handling

### Frontend
- Try/catch blocks on all API calls
- Error messages displayed to user
- Fallback UI for connection errors
- Console logging for debugging

### Backend
- Request validation before processing
- Mongoose schema validation
- Global error handler middleware
- Descriptive error messages
- Different responses for dev vs. production

## Testing Checklist

- [ ] Backend starts without errors
- [ ] MongoDB connection successful
- [ ] Redis connection successful
- [ ] GET /api/feed returns feeds
- [ ] POST /api/feed creates feed
- [ ] Frontend loads on localhost:3000
- [ ] WebSocket connects (check green status)
- [ ] Create feed on admin page
- [ ] Feed appears instantly on home page
- [ ] Refresh home page, feed still shows
- [ ] Open multiple browser tabs
- [ ] Feed on admin appears on all tabs instantly
- [ ] Disconnect internet, reconnect
- [ ] Socket reconnects automatically
- [ ] Cache working (check logs for "cache hit")

## Future Enhancements

1. **Authentication**: User accounts and permissions
2. **Comments**: Comment on feeds and replies
3. **Like Tracking**: Track which users liked which feeds
4. **Search**: Full-text search on feeds
5. **Notifications**: Push notifications for new feeds
6. **Analytics**: Track feed engagement
7. **Moderation**: Admin feed review system
8. **Media**: Image/video support in feeds
9. **Pagination**: Load feeds incrementally
10. **Filtering**: Advanced filter options

## Debugging Guide

### Check Backend Logs
```bash
# Watch for:
# ✅ MongoDB connected
# ✅ Redis connected and working
# 📦 Serving feeds from cache / 💾 Cache miss
# 🔌 Client connected
# 📢 Broadcasted new_feed
```

### Check Frontend Console
```javascript
// Look for:
// ✅ Socket connected
// 📡 New feed received
// ✅ Feeds loaded
// Socket connection status changes
```

### Redis Cache Monitoring
```
Check logs: "Serving feeds from cache"
Cache hits = successful optimization
Cache misses = normal after invalidation
```

### MongoDB Query Performance
```
Use MongoDB Atlas Metrics
Watch for slow queries
Monitor index usage
Check connection count
```
