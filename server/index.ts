import "./lib/loadEnv";
import express from "express";
import cors from "cors";
import { errorHandler } from "./middleware/error";
import resumeRoutes from "./routes/resume";
import roadmapRoutes from "./routes/roadmap";
import linkedinRoutes from "./routes/linkedin";
import dashboardRoutes from "./routes/dashboard";
import githubRoutes from "./routes/github";
import leetcodeRoutes from "./routes/leetcode";
import readinessRoutes from "./routes/readiness";
import careerInsightsRoutes from "./routes/career-insights";

import { validateBackendEnv } from "./lib/env";

const app = express();
const PORT = process.env.AI_SERVER_PORT || 3001;

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for unauthorized origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (_req, res) => {
  const audit = validateBackendEnv();
  res.json({
    status: "ok",
    service: "careerbuddy-ai-server",
    environment: process.env.NODE_ENV || "development",
    readiness: audit.isReady ? "ready" : "degraded",
    services: audit.status,
  });
});

app.use(resumeRoutes);
app.use(roadmapRoutes);
app.use(linkedinRoutes);
app.use(dashboardRoutes);
app.use(githubRoutes);
app.use(leetcodeRoutes);
app.use(readinessRoutes);
app.use(careerInsightsRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  const audit = validateBackendEnv();
  console.log(`[ai-server] CareerBuddy AI server running on port ${PORT}`);
  console.log(`[ai-server] Readiness: ${audit.isReady ? "READY" : "DEGRADED"}`);
  if (audit.warnings.length > 0) {
    audit.warnings.forEach((w) => console.warn(`[ai-server] Warning: ${w}`));
  }
});

export default app;
