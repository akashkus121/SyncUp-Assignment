const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/syncup";

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
      isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("⚠️  MongoDB disconnected. Retrying...");
      isConnected = false;
      setTimeout(connectDB, 5000);
    });
  } catch (err) {
    console.error("❌ MongoDB initial connection failed:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
