import { Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { AuthenticatedRequest } from "../../types/auth";
import { createTaskSchema } from "./tasks.validation";
import {
  createTaskService,
  deleteTaskService,
  listTasksService,
  updateTaskService
} from "./tasks.service";

export const listTasks = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  const tasks = await listTasksService(user.sub, user.role);
  res.json(tasks);
};

export const createTask = async (req: Request, res: Response) => {
  const user = (req as AuthenticatedRequest).user!;
  if (user.role === "VIEWER") {
    return res.status(403).json({ message: "You are not allowed to create tasks" });
  }

  const payload = createTaskSchema.parse(req.body);
  const task = await createTaskService(payload, user.sub);
  res.status(201).json(task);
};

export const updateTask = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = (req as AuthenticatedRequest).user!;
  const payload = createTaskSchema.partial().parse(req.body);

  if (user.role === "VIEWER") {
    return res.status(403).json({ message: "Viewer has read-only access" });
  }

  if (user.role === "TEAM_MEMBER") {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { assignedTo: true }
    });
    if (!task || task.assignedTo !== user.sub) {
      return res.status(403).json({ message: "You can only update your own tasks" });
    }

    const restrictedPayload = { status: payload.status };
    const updated = await updateTaskService(id, restrictedPayload, user.sub);
    return res.json(updated);
  }

  const task = await updateTaskService(id, payload, user.sub);
  res.json(task);
};

export const updateTaskStatus = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const user = (req as AuthenticatedRequest).user!;
  const { status } = req.body as { status: string };

  if (user.role === "VIEWER") {
    return res.status(403).json({ message: "Viewer has read-only access" });
  }

  if (user.role === "TEAM_MEMBER") {
    const task = await prisma.task.findUnique({
      where: { id },
      select: { assignedTo: true }
    });
    if (!task || task.assignedTo !== user.sub) {
      return res.status(403).json({ message: "You can only update your own tasks" });
    }
  }

  const updated = await updateTaskService(id, { status }, user.sub);
  res.json(updated);
};

export const deleteTask = async (req: Request, res: Response) => {
  const id = String(req.params.id);
  await deleteTaskService(id);
  res.status(204).send();
};
