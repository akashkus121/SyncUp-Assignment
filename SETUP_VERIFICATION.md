# Setup Verification Checklist

Complete this checklist to ensure your application is properly set up.

## ✅ Prerequisites
- [ ] Node.js 16+ installed (`node --version`)
- [ ] npm/yarn installed (`npm --version`)
- [ ] MongoDB Atlas account (or local MongoDB)
- [ ] Upstash Redis account (or local Redis)

## ✅ Backend Setup

### 1. Project Structure
- [ ] `Backend/config/db.js` exists
- [ ] `Backend/config/redis.js` exists
- [ ] `Backend/models/Feed.js` exists
- [ ] `Backend/routes/feed.js` exists
- [ ] `Backend/socket.js` exists
- [ ] `Backend/server.js` exists
- [ ] `Backend/package.json` exists

### 2. Dependencies
- [ ] Run `cd Backend && npm install`
- [ ] Verify packages installed: express, mongoose, socket.io, @upstash/redis

### 3. Environment Variables
- [ ] Copy `Backend/.env.example` to `Backend/.env`
- [ ] Add MongoDB URI: `MONGODB_URI=mongodb+srv://...`
- [ ] Add Redis URL: `UPSTASH_REDIS_REST_URL=https://...`
- [ ] Add Redis token: `UPSTASH_REDIS_REST_TOKEN=...`
- [ ] Set PORT=5000
- [ ] Set CORS_ORIGIN=http://localhost:3000

### 4. Start Backend
- [ ] Run `npm start` or `npm run dev`
- [ ] See: "✅ MongoDB connected"
- [ ] See: "✅ Redis connected and working"
- [ ] See: "🚀 SyncUp Backend running" on Port 5000

### 5. Test Backend APIs
- [ ] Visit http://localhost:5000/health
- [ ] Expected: `{"status":"ok",...}`
- [ ] Run: `curl http://localhost:5000/api/feed`
- [ ] Expected: `{"success":true,"data":[...]}`

## ✅ Frontend Setup

### 1. Project Structure
- [ ] `Frontend/pages/_app.js` exists
- [ ] `Frontend/pages/_document.js` exists
- [ ] `Frontend/pages/index.js` exists
- [ ] `Frontend/pages/admin.js` exists
- [ ] `Frontend/components/FeedList.js` exists
- [ ] `Frontend/components/FeedForm.js` exists
- [ ] `Frontend/utils/socket.js` exists
- [ ] `Frontend/utils/api.js` exists
- [ ] `Frontend/styles/` folder with CSS files exists

### 2. Dependencies
- [ ] Run `cd Frontend && npm install`
- [ ] Verify packages: next, react, socket.io-client, axios

### 3. Environment Variables
- [ ] Copy `Frontend/.env.example` to `Frontend/.env.local`
- [ ] Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
- [ ] Set NEXT_PUBLIC_SOCKET_URL=http://localhost:5000

### 4. Start Frontend
- [ ] Run `npm run dev`
- [ ] See: "Ready in X.XXXs"
- [ ] Visit http://localhost:3000

### 5. Frontend Pages Load
- [ ] Home page (/) loads with header and status
- [ ] Admin page (/admin) loads with form
- [ ] Status shows "🟡 Connecting..." or "🟢 Connected"

## ✅ Real-time Features

### 1. Connection
- [ ] Open browser DevTools Console
- [ ] On Home page, see: "✅ Connected to socket server"
- [ ] Status indicator shows green 🟢

### 2. Create Feed
- [ ] Go to /admin page
- [ ] Fill in form: Author, Title, Content
- [ ] Click "🚀 Publish Feed"
- [ ] See success message: "✅ Feed created successfully!"

### 3. Real-time Update
- [ ] Keep Home page open in another tab
- [ ] Submit feed from Admin page
- [ ] Watch Home page - feed appears instantly (no refresh needed!)
- [ ] See notification: "✨ New feed from [Author]!"

### 4. Cache Working
- [ ] Refresh Home page immediately after creating feed
- [ ] Check backend logs for "📦 Serving feeds from cache"
- [ ] Wait 61 seconds, refresh again
- [ ] Check backend logs for "💾 Cache miss, fetching from MongoDB"

### 5. Deduplication
- [ ] Open 2 browser tabs, both on Home page
- [ ] Create feed from Admin page
- [ ] Both tabs show feed exactly once (no duplicates)
- [ ] Check backend logs - only 1 broadcast per event

## ✅ Advanced Testing

### 1. Error Handling
- [ ] Go to Admin, leave title empty, click submit
- [ ] See error: "Title is required"
- [ ] Create valid feed, should succeed

### 2. Form Validation
- [ ] Admin form shows character counts
- [ ] Cannot exceed max length for title (200)
- [ ] Cannot exceed max length for content (2000)
- [ ] Category dropdown shows all 6 options

### 3. Connection Recovery
- [ ] Home page connected (🟢 status)
- [ ] Disconnect internet (on Windows: netsh interface set interface WiFi disabled)
- [ ] Wait a few seconds, status shows 🔴
- [ ] Reconnect internet
- [ ] Watch status change back to 🟢 (auto-reconnect!)
- [ ] Create new feed, should appear on all reconnected clients

### 4. Multiple Tabs Sync
- [ ] Open http://localhost:3000 in 2 tabs
- [ ] Open /admin in third tab
- [ ] Create feed from admin tab
- [ ] Both home tabs instantly show the feed (no refresh needed!)

### 5. Browser Compatibility
- [ ] Test on Chrome/Chromium ✓
- [ ] Test on Firefox ✓
- [ ] Test on Edge ✓
- [ ] Test on Safari ✓

## ✅ Database Verification

### MongoDB
- [ ] Log in to MongoDB Atlas
- [ ] Navigate to your cluster
- [ ] Find "syncup" database
- [ ] Find "feeds" collection
- [ ] Should show created feeds

### Redis
- [ ] No direct UI for verification
- [ ] Check backend logs for: "✅ Redis connected and working"
- [ ] Check cache hits in logs when fetching feeds

## ✅ Documentation

- [ ] README.md exists and is readable
- [ ] QUICK_START.md provides clear instructions
- [ ] ARCHITECTURE.md explains system design
- [ ] .env.example files show all variables needed

## 🚀 Ready to Deploy?

Before deploying to production:
- [ ] Update CORS_ORIGIN to production frontend URL
- [ ] Update MONGODB_URI to production database
- [ ] Update NEXT_PUBLIC_API_URL to production backend
- [ ] Update NEXT_PUBLIC_SOCKET_URL to production backend
- [ ] Set NODE_ENV=production
- [ ] Run `npm run build` on frontend
- [ ] Test all features on production setup
- [ ] Set up error tracking/monitoring
- [ ] Enable HTTPS/SSL certificates

## 🐛 Troubleshooting

If anything fails:

1. **Backend won't start**
   - Check MongoDB connection string
   - Verify Redis credentials
   - Check port 5000 not in use
   - Look for error messages in console

2. **Frontend won't load**
   - Verify backend is running first
   - Check NEXT_PUBLIC_API_URL is correct
   - Look for errors in DevTools Console
   - Try clearing .next folder and restart

3. **No real-time updates**
   - Check WebSocket connection in DevTools (Network tab)
   - Verify Socket.IO status (should see "connected")
   - Check backend logs for socket events
   - Verify CORS_ORIGIN matches frontend URL

4. **Cache not working**
   - Check Redis connection logs
   - Verify UPSTASH credentials are correct
   - Try creating/fetching feeds and watching logs

## 📊 Expected Behavior

### First-time User
1. Opens home page → sees "Loading feeds..."
2. Loads all feeds from MongoDB (slower first time)
3. Sees them rendered instantly
4. Sees green connection status
5. Creates feed → appears instantly on home page (no refresh)

### Returning User (within 60s)
1. Opens home page → sees feeds immediately (from cache)
2. Creates feed → appears instantly on home page
3. All WebSocket events work smoothly

### After 60 seconds of Cache
1. Opens home page
2. Backend fetches fresh data from MongoDB
3. Shows latest feeds (in case DB was updated externally)

---

## ✅ Completion

When all items are checked, your real-time coaching feed application is ready!

**Estimated time:** 15-30 minutes

**Difficulty:** Easy to Medium

**What you'll learn:**
- Real-time WebSocket communication
- Redis caching strategy
- MongoDB indexing
- Next.js full-stack development
- REST API design
- Error handling and recovery

Enjoy! 🎉
