import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("FATAL: MONGO_URI is not set. Add it to backend/.env and restart the server.");
    process.exit(1);
  }

  // Surfacing connection lifecycle events makes MongoDB issues diagnosable.
  // The MongoDB driver auto-reconnects after transient outages, so the app
  // stays online without a manual restart.
  mongoose.connection.on("connected", () => {
    console.log(`MongoDB connected: ${mongoose.connection.host}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error(`MongoDB error: ${err.message}`);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected. Waiting for the driver to reconnect...");
  });
  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected.");
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      heartbeatFrequencyMS: 10000,
      minPoolSize: 2,
      maxPoolSize: 20,
      retryWrites: true,
      autoIndex: process.env.NODE_ENV === "development",
    });
  } catch (error) {
    // Fail fast instead of silently falling back to a throwaway in-memory
    // database. A silent fallback previously caused data loss on restart and
    // made authentication appear broken.
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error(
      "Check MONGO_URI, credentials, and MongoDB Atlas network access (IP allowlist). No fallback database is used."
    );
    process.exit(1);
  }
};

export default connectDB;
