# Quick Start Guide - SyncUp Coaching Feed

## Step 1: Start the Backend

```bash
# Navigate to Backend directory
cd Backend

# Install dependencies (only first time)
npm install

# Start development server
npm run dev
```

Expected output:
```
✅ MongoDB connected: cluster0.fao7rm4.mongodb.net
✅ Redis connected and working
╔════════════════════════════════════╗
║  🚀 SyncUp Backend running          ║
║  Port  : 5000                      ║
║  Env   : development               ║
╚════════════════════════════════════╝
```

## Step 2: Start the Frontend

Open a new terminal window:

```bash
# Navigate to Frontend directory
cd Frontend

# Install dependencies (only first time)
npm install

# Start development server
npm run dev
```

Expected output:
```
> next dev
Ready in X.XXXs
```

## Step 3: Open the Application

Open your browser and navigate to:
- **Home Page**: http://localhost:3000
- **Admin Page**: http://localhost:3000/admin

## Testing Real-time Updates

1. **Home Page** (http://localhost:3000)
   - Shows all feeds from database
   - Shows real-time connection status (green dot)
   - Feeds appear instantly when published from admin

2. **Admin Page** (http://localhost:3000/admin)
   - Fill in the form with coaching content
   - Click "🚀 Publish Feed"
   - See success notification
   - Go back to Home Page to see the feed appear in real-time!

## Troubleshooting

### Backend not connecting to MongoDB
- Check `.env` file for correct `MONGODB_URI`
- Verify MongoDB Atlas IP whitelist includes your IP
- Check MongoDB username and password

### Redis connection errors
- Ensure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check network connectivity to Redis

### Frontend can't connect to backend
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in Frontend/.env.local
- Check CORS is properly configured

### Real-time updates not working
- Check browser console for Socket.IO errors
- Verify WebSocket connection is established (green status)
- Check backend Socket.IO logs

## Example Feed

Try creating a feed with this content:

**Author**: Coach Sarah  
**Title**: The Power of Consistency Over Intensity  
**Category**: Motivation  
**Content**:
```
Consistency beats intensity every single time. Many people think they need 
to train hard for a few weeks and see results. Reality check: sustained 
effort over months and years is what builds champions. 

Focus on:
- Small daily improvements
- Showing up even when you don't feel like it
- Building unbreakable habits
- Progress over perfection

Remember: You don't rise to the level of your goals, 
you fall to the level of your systems.
```
**Tags**: consistency, training, mindset, coaching  
**Pin**: Yes

## API Testing

### Fetch all feeds
```bash
curl http://localhost:5000/api/feed
```

### Create a new feed
```bash
curl -X POST http://localhost:5000/api/feed \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Feed",
    "content": "This is a test",
    "author": "Tester",
    "category": "motivation"
  }'
```

### Health check
```bash
curl http://localhost:5000/health
```

## Key Features to Check

✅ **Real-time Updates**: Create feed on admin, see it appear on home page instantly  
✅ **Cache**: First GET request fetches from DB, subsequent requests within 60s use cache  
✅ **Deduplication**: Multiple subscribers receive each feed exactly once  
✅ **Reconnection**: Close browser, reopen - automatically reconnects  
✅ **Error Handling**: Try creating feed with empty title - see validation error  
✅ **Connection Status**: Watch the status indicator change colors  

## Performance Tips

- **Feeds load fast**: First time loads from MongoDB (with cache), subsequent refreshes are instant
- **Real-time**: Socket.IO pushes new feeds to all connected clients immediately
- **No refresh needed**: Just watch the page - new feeds appear automatically
- **Smooth animations**: CSS animations for card entry and like button feedback

## Next Steps

After testing the basic functionality:

1. Explore the code and understand the architecture
2. Test with multiple browser tabs (see real-time sync)
3. Check browser developer tools (Network and Console tabs)
4. Review the MongoDB collections in Atlas
5. Monitor Redis cache hits/misses in logs
6. Try the stress test: Create multiple feeds rapidly

Enjoy! 🚀
