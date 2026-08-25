const express = require("express");
const router = express.Router();

const Feed = require("../models/Feed");
const { cacheGet, cacheSet, cacheDel } = require("../config/redis");
const { broadcastNewFeed, broadcastFeedLike, broadcastDeleteFeed } = require("../socket");

const FEED_CACHE_KEY = "all_feeds";
const FEED_CACHE_TTL = 60;

/**
 * GET /api/feed
 * Fetch all feeds with cache strategy
 * - Check Redis cache first
 * - If miss, fetch from MongoDB, cache it, and return
 */
router.get("/", async (req, res, next) => {
  try {
    // Try cache first
    let feeds = await cacheGet(FEED_CACHE_KEY);
    if (feeds) {
      console.log("📦 Serving feeds from cache");
      return res.json({
        success: true,
        source: "cache",
        count: feeds.length,
        data: feeds,
      });
    }

    // Cache miss — fetch from DB
    console.log("💾 Cache miss, fetching from MongoDB");
    feeds = await Feed.find()
      .sort({ isPinned: -1, createdAt: -1 })
      .select("-__v")
      .lean();

    // Cache the result
    await cacheSet(FEED_CACHE_KEY, feeds, FEED_CACHE_TTL);

    res.json({
      success: true,
      source: "database",
      count: feeds.length,
      data: feeds,
    });
  } catch (err) {
    console.error("GET /feed error:", err.message);
    next(err);
  }
});

/**
 * GET /api/feed/:id
 * Fetch a single feed by ID
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid feed ID format",
      });
    }

    const feed = await Feed.findById(id).select("-__v").lean();

    if (!feed) {
      return res.status(404).json({
        success: false,
        error: "Feed not found",
      });
    }

    res.json({
      success: true,
      data: feed,
    });
  } catch (err) {
    console.error("GET /feed/:id error:", err.message);
    next(err);
  }
});

/**
 * POST /api/feed
 * Create a new feed
 * - Validate input
 * - Save to MongoDB
 * - Invalidate cache
 * - Broadcast via WebSocket for realtime update
 */
router.post("/", async (req, res, next) => {
  try {
    const { title, content, author, category, tags, isPinned } = req.body;

    // Validation
    if (!title || !content || !author) {
      return res.status(400).json({
        success: false,
        error: "title, content, and author are required",
      });
    }

    // Create and save to DB
    const newFeed = new Feed({
      title,
      content,
      author,
      category: category || "motivation",
      tags: tags || [],
      isPinned: isPinned || false,
    });

    await newFeed.save();
    console.log(`✅ New feed created: ${newFeed._id}`);

    // Invalidate cache
    await cacheDel(FEED_CACHE_KEY);
    console.log(`🗑️  Cleared feed cache`);

    // Broadcast to all connected clients via WebSocket
    const io = req.app.get("io");
    if (io) {
      broadcastNewFeed(io, newFeed.toObject());
    }

    res.status(201).json({
      success: true,
      message: "Feed created successfully",
      data: newFeed,
    });
  } catch (err) {
    console.error("POST /feed error:", err.message);
    next(err);
  }
});

/**
 * PUT /api/feed/:id
 * Update an existing feed
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, author, category, tags, isPinned, likes } = req.body;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid feed ID format",
      });
    }

    // Build update object
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (author !== undefined) updateData.author = author;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (likes !== undefined) updateData.likes = likes;

    const updatedFeed = await Feed.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!updatedFeed) {
      return res.status(404).json({
        success: false,
        error: "Feed not found",
      });
    }

    // Invalidate cache
    await cacheDel(FEED_CACHE_KEY);

    res.json({
      success: true,
      message: "Feed updated successfully",
      data: updatedFeed,
    });
  } catch (err) {
    console.error("PUT /feed/:id error:", err.message);
    next(err);
  }
});

/**
 * DELETE /api/feed/:id
 * Delete a feed
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid feed ID format",
      });
    }

    const deletedFeed = await Feed.findByIdAndDelete(id);

    if (!deletedFeed) {
      return res.status(404).json({
        success: false,
        error: "Feed not found",
      });
    }

    // Invalidate cache
    await cacheDel(FEED_CACHE_KEY);

    // Broadcast via socket
    const io = req.app.get("io");
    if (io) {
      broadcastDeleteFeed(io, id);
    }

    res.json({
      success: true,
      message: "Feed deleted successfully",
      data: deletedFeed,
    });
  } catch (err) {
    console.error("DELETE /feed/:id error:", err.message);
    next(err);
  }
});

/**
 * PATCH /api/feed/:id/like
 * Increment likes count for a feed post
 */
router.patch("/:id/like", async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        error: "Invalid feed ID format",
      });
    }

    const updatedFeed = await Feed.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    ).select("-__v");

    if (!updatedFeed) {
      return res.status(404).json({
        success: false,
        error: "Feed not found",
      });
    }

    // Clear cache
    await cacheDel(FEED_CACHE_KEY);

    // Broadcast live like count update to all clients
    const io = req.app.get("io");
    if (io) {
      broadcastFeedLike(io, id, updatedFeed.likes);
    }

    res.json({
      success: true,
      message: "Feed liked",
      data: updatedFeed,
    });
  } catch (err) {
    console.error("PATCH /feed/:id/like error:", err.message);
    next(err);
  }
});

module.exports = router;

