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

// CORS for Railway (production-safe, stable origin allowlist)
// Requirement: only allow these origins.
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:8080",
  "https://promanage-production-09a3.up.railway.app"
];

const normalizeOrigin = (o: string) => o.replace(/\/+$/, "");
const normalizedAllowedOrigins = new Set(allowedOrigins.map(normalizeOrigin));

app.use(
  cors({
    origin: (origin, callback) => {
      // Non-browser requests may not send Origin header.
      if (!origin) return callback(null, true);

      const ok = normalizedAllowedOrigins.has(normalizeOrigin(origin));
      return callback(null, ok);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204
  })
);

// Ensure OPTIONS preflight always gets handled.
app.options("*", cors());




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

