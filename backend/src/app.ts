import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./lib/env";
import { errorHandler } from "./middlewares/error.middleware";
import { activityRouter } from "./modules/activity/activity.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { calendarRouter } from "./modules/calendar/calendar.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { notificationsRouter } from "./modules/notifications/notifications.routes";
import { projectsRouter } from "./modules/projects/projects.routes";
import { tasksRouter } from "./modules/tasks/tasks.routes";
import { usersRouter } from "./modules/users/users.routes";

export const app = express();

// CORS: support multiple origins + proper preflight handling.
// Railway environments often use different frontend hostnames (and sometimes no env vars are set as expected).
// Configure allowed origins via:
// - FRONTEND_URL (single)
// - CORS_ORIGIN (optional)
// - CORS_ORIGINS (optional, comma-separated list)
const allowedOrigins = [
  // local dev
  "http://localhost:3000",
  "http://localhost:8080",

  // production / deployed
  env.FRONTEND_URL,
  env.CORS_ORIGIN,

  // optional env var: "https://a.com,https://b.com"
  (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
].flat().filter(Boolean);

// Normalize origins (e.g. remove trailing slashes)
const normalize = (o: string) => o.replace(/\/+$/, "");
const normalizedAllowedOrigins = new Set(allowedOrigins.map(normalize));

app.use(
  cors({
    // Important: cors() should run *before* any routes and should never be blocked.
    // We only validate which origins get headers.
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = normalizedAllowedOrigins.has(normalize(origin));
      // If not allowed: return false so headers aren't reflected.
      return callback(null, isAllowed);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],

    // Ensure browser gets CORS headers even for preflight
    optionsSuccessStatus: 204
  })
);

// Extra safety for Express 5: force preflight to always be handled by cors middleware.
app.options("/api/*", cors());





// No explicit wildcard OPTIONS handler needed.
// `cors()` middleware already handles preflight requests (OPTIONS) for all matched routes.
// Keeping wildcard OPTIONS handlers can cause Express 5 routing/path-to-regexp issues.



app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).send("Backend is running successfully");
});

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "TaskNest API" }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/activity", activityRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/calendar", calendarRouter);

// Safe 404 handler (must be after all routes)
app.use((_req, res) => {
  res.status(404).json({ message: "Not found" });
});

app.use(errorHandler);

