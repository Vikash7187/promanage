import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AuthenticatedRequest } from "../../types/auth";
import { createProjectSchema } from "./projects.validation";
import {
  createProjectService,
  deleteProjectService,
  listProjectsService,
  updateProjectService
} from "./projects.service";

export const listProjects = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const projects = await listProjectsService(user.sub, user.role);
  res.json(projects);
};

export const createProject = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const payload = createProjectSchema.parse(req.body);
  const project = await createProjectService(payload, user.sub, user.role);
  res.status(201).json(project);
};

export const updateProject = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = (req as AuthenticatedRequest).user!;

  if (user.role === "PROJECT_MANAGER") {
    const project = await prisma.project.findUnique({ where: { id }, select: { managerId: true } });
    if (!project || project.managerId !== user.sub) {
      return res.status(403).json({ message: "You can only manage your own projects" });
    }
  }

  const payload = createProjectSchema.partial().parse(req.body);
  const project = await updateProjectService(id, payload, user.sub);
  res.json(project);
};

export const deleteProject = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = (req as AuthenticatedRequest).user!;

  if (user.role === "PROJECT_MANAGER") {
    const project = await prisma.project.findUnique({ where: { id }, select: { managerId: true } });
    if (!project || project.managerId !== user.sub) {
      return res.status(403).json({ message: "You can only manage your own projects" });
    }
  }

  await deleteProjectService(id);
  res.status(204).send();
};
