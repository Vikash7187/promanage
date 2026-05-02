import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middlewares/auth.middleware";

export const calendarRouter = Router();

calendarRouter.use(authenticate);
calendarRouter.get("/", async (_req, res) => {
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({ select: { id: true, title: true, deadline: true } }),
    prisma.task.findMany({ select: { id: true, title: true, dueDate: true, status: true } })
  ]);

  res.json({
    projectEvents: projects,
    taskEvents: tasks
  });
});
