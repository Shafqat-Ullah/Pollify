import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import pollRoutes from "./routes/poll.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import errorHandler, { notFound } from "./middlewares/error.middleware.js";
import { globalLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
app.use(globalLimiter);

app.get("/api/health", (req, res) => res.status(200).json({ success: true, message: "Pollify API is running." }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
