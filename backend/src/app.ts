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

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8080",
      env.FRONTEND_URL,
      env.CORS_ORIGIN
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "TaskNest API" }));

app.use("/api/auth", authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", usersRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/activity", activityRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/calendar", calendarRouter);

app.use(errorHandler);
