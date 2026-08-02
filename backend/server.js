import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import { initSocket } from "./socket.js";

const PORT = process.env.PORT || 5000;

const warnIfPlaceholderSecrets = () => {
  const access = process.env.JWT_ACCESS_SECRET || "";
  const refresh = process.env.JWT_REFRESH_SECRET || "";
  if (access.startsWith("change_this") || refresh.startsWith("change_this")) {
    console.warn(
      "WARNING: JWT secrets are placeholders. Set strong random secrets in backend/.env before deploying to production."
    );
  }
};

// Log instead of killing the process. Previously process.exit(1) here meant a
// single stray rejected promise took the entire API offline until a manual
// restart — the root cause of intermittent "failed to connect" errors.
process.on("unhandledRejection", (reason) => {
  console.error(
    "Unhandled promise rejection:",
    reason instanceof Error ? reason.stack : reason
  );
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err.stack);
});

let server;

const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  if (!server) return process.exit(0);
  server.close(async () => {
    try {
      await mongoose.disconnect();
    } catch (err) {
      console.error("Error while disconnecting MongoDB:", err.message);
    }
    console.log("Graceful shutdown complete.");
    process.exit(0);
  });
  // Safety net in case connections refuse to close.
  setTimeout(() => process.exit(1), 15000).unref();
};

const start = async () => {
  warnIfPlaceholderSecrets();
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`Pollify API running on http://localhost:${PORT} [${process.env.NODE_ENV}]`);
  });
  initSocket(server);

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
};

start();
