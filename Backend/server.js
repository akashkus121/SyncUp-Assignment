require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { connectRedis } = require("./config/redis");
const { setupSocket } = require("./socket");
const feedRoutes = require("./routes/feed");

// ─── App & HTTP server ────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

// Dynamic CORS handler supporting localhost, Vercel preview URLs, and production domains
const corsOriginHandler = (origin, callback) => {
  if (!origin) return callback(null, true); // Allow server-to-server, curl, keep-alive
  return callback(null, true); // Allow all web origins smoothly
};

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: corsOriginHandler,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  },
  // Reconnection handled on client; server-side: pingTimeout & pingInterval
  pingTimeout: 20000,
  pingInterval: 10000,
  // Prevent duplicate events on reconnect via connection state recovery
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
});

// Attach io to app so routes can access it via req.app.get("io")
app.set("io", io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: corsOriginHandler,
  credentials: true,
}));
app.use(morgan("dev"));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "syncup-backend",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

app.use("/api/feed", feedRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
});

// ─── Socket setup ─────────────────────────────────────────────────────────────
setupSocket(io);

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await connectDB();
    await connectRedis();

    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════╗
║  🚀 SyncUp Backend running          ║
║  Port  : ${PORT}                      ║
║  Env   : ${process.env.NODE_ENV || "development"}               ║
╚════════════════════════════════════╝
      `);

      // Automated Keep-Alive Ping Service (runs every 4.5 mins to prevent hosting sleep)
      const KEEP_ALIVE_INTERVAL = 4.5 * 60 * 1000;
      setInterval(() => {
        const url = process.env.SERVER_URL || `http://127.0.0.1:${PORT}/health`;
        http.get(url, (res) => {
          console.log(`💓 [Keep-Alive] Ping sent to ${url} — Status: ${res.statusCode}`);
        }).on("error", (err) => {
          console.warn(`⚠️ [Keep-Alive] Ping failed:`, err.message);
        });
      }, KEEP_ALIVE_INTERVAL);
    });
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000); // force-kill after 10s
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

start();
