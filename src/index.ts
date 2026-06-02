import express from "express";
import cors from "cors";
import projectRoutes from "./routes/project.routes.js";
import { config, connectDb } from "./config/index.js";
import logger from "./utils/logger.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use(requestLogger);

app.use((_req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; img-src * data: blob:; frame-src *;"
  );
  next();
});

// Health endpoint (no auth)
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Routes
app.use("/projects", projectRoutes);

// Error handler middleware (must be last)
app.use(errorHandler);

connectDb().then(() => {
  app.listen(config.port, () => {
    logger.info(`✅ Project Service running on port ${config.port}`);
  });
});
