const { cacheGet, cacheSet } = require("../config/redis");

/**
 * Express middleware that:
 *  1. Checks Redis for a cached response.
 *  2. If hit → return cached JSON immediately (with X-Cache: HIT header).
 *  3. If miss → let the route handler run, then intercept res.json() to store result.
 */
const cacheMiddleware = (keyFn, ttl) => {
  return async (req, res, next) => {
    const cacheKey = typeof keyFn === "function" ? keyFn(req) : keyFn;

    try {
      const cached = await cacheGet(cacheKey);
      if (cached !== null) {
        return res.set("X-Cache", "HIT").json(cached);
      }
    } catch {
      // Cache unavailable — proceed normally
    }

    // Monkey-patch res.json to capture and cache the outgoing payload
    const originalJson = res.json.bind(res);
    res.json = async (data) => {
      res.json = originalJson; // restore immediately to avoid loops
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await cacheSet(cacheKey, data, ttl);
      }
      res.set("X-Cache", "MISS");
      return originalJson(data);
    };

    next();
  };
};

module.exports = cacheMiddleware;