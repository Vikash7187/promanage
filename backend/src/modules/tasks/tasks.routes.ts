import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createTask, deleteTask, listTasks, updateTask, updateTaskStatus } from "./tasks.controller";

export const tasksRouter = Router();

tasksRouter.use(authenticate);
tasksRouter.get("/", listTasks);
tasksRouter.post("/", authorize(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_MEMBER), createTask);
tasksRouter.patch("/:id", authorize(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_MEMBER), updateTask);
tasksRouter.patch("/:id/status", authorize(Role.ADMIN, Role.PROJECT_MANAGER, Role.TEAM_MEMBER), updateTaskStatus);
tasksRouter.delete("/:id", authorize(Role.ADMIN, Role.PROJECT_MANAGER), deleteTask);
