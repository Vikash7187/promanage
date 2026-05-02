import { Router } from "express";
import { Role } from "@prisma/client";
import { authenticate, authorize } from "../../middlewares/auth.middleware";
import { createProject, deleteProject, listProjects, updateProject } from "./projects.controller";

export const projectsRouter = Router();

projectsRouter.use(authenticate);
projectsRouter.get("/", listProjects);
projectsRouter.post("/", authorize(Role.ADMIN, Role.PROJECT_MANAGER), createProject);
projectsRouter.patch("/:id", authorize(Role.ADMIN, Role.PROJECT_MANAGER), updateProject);
projectsRouter.delete("/:id", authorize(Role.ADMIN, Role.PROJECT_MANAGER), deleteProject);
