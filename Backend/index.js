/**
 * Socket.IO manager
 * Handles:
 *  - Client connect/disconnect
 *  - Deduplication via eventId tracking per socket
 *  - Feed room broadcasting
 *  - Reconnection-safe event emission
 */

const FEED_ROOM = "feed";

// Track recent eventIds per socket to prevent duplicate processing (client → server)
// Uses a sliding window of the last 50 event IDs
const MAX_TRACKED_EVENTS = 50;

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);
    const recentEventIds = [];

    // Automatically join the feed room
    socket.join(FEED_ROOM);
    socket.emit("connected", {
      socketId: socket.id,
      message: "Connected to SyncUp realtime feed",
      timestamp: new Date().toISOString(),
    });

    // Handle explicit room join (allows future multi-room support)
    socket.on("join_feed", (data, ack) => {
      socket.join(FEED_ROOM);
      console.log(`📡 ${socket.id} joined feed room`);
      if (typeof ack === "function") {
        ack({ success: true, room: FEED_ROOM });
      }
    });

    // Deduplication helper — returns true if event is a duplicate
    const isDuplicate = (eventId) => {
      if (!eventId) return false;
      if (recentEventIds.includes(eventId)) {
        console.warn(`⚠️  Duplicate event ignored: ${eventId}`);
        return true;
      }
      recentEventIds.push(eventId);
      if (recentEventIds.length > MAX_TRACKED_EVENTS) {
        recentEventIds.shift(); // sliding window
      }
      return false;
    };

    // Client can ping to check connection health
    socket.on("ping_server", ({ eventId } = {}, ack) => {
      if (isDuplicate(eventId)) return;
      if (typeof ack === "function") {
        ack({ pong: true, timestamp: new Date().toISOString() });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Client disconnected: ${socket.id} — reason: ${reason}`);
    });

    socket.on("error", (err) => {
      console.error(`❌ Socket error [${socket.id}]:`, err.message);
    });
  });
};

/**
 * Broadcast a new feed item to all clients in the feed room.
 * Called from the POST /feed route after DB insert.
 */
const broadcastNewFeed = (io, feedItem) => {
  io.to(FEED_ROOM).emit("new_feed", {
    eventId: `feed_${feedItem._id}_${Date.now()}`,
    feed: feedItem,
    timestamp: new Date().toISOString(),
  });
  console.log(`📢 Broadcasted new_feed to room "${FEED_ROOM}": ${feedItem._id}`);
};

/**
 * Broadcast a feed deletion (if needed later).
 */
const broadcastDeleteFeed = (io, feedId) => {
  io.to(FEED_ROOM).emit("delete_feed", {
    eventId: `del_${feedId}_${Date.now()}`,
    feedId,
    timestamp: new Date().toISOString(),
  });
};

module.exports = { setupSocket, broadcastNewFeed, broadcastDeleteFeed, FEED_ROOM };