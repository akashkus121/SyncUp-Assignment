const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_TTL = 60; // seconds

/**
 * Get cached value
 */
const cacheGet = async (key) => {
  try {
    const value = await redis.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    console.error("Redis GET error:", err.message);
    return null;
  }
};

/**
 * Set cached value with TTL
 */
const cacheSet = async (key, value, ttl = CACHE_TTL) => {
  try {
    await redis.set(key, JSON.stringify(value), {
      ex: ttl,
    });
  } catch (err) {
    console.error("Redis SET error:", err.message);
  }
};

/**
 * Delete cached key
 */
const cacheDel = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis DEL error:", err.message);
  }
};

/**
 * Optional health check
 */
const connectRedis = async () => {
  try {
    await redis.set("health_check", "ok", { ex: 5 });
    console.log("✅ Redis connected and working");
    return true;
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
    return false;
  }
};

module.exports = {
  cacheGet,
  cacheSet,
  cacheDel,
  connectRedis,
  CACHE_TTL,
};
