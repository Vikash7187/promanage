import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middlewares/auth.middleware";
import { AuthenticatedRequest } from "../../types/auth";

export const notificationsRouter = Router();

notificationsRouter.use(authenticate);
notificationsRouter.get("/", async (req, res) => {
  const userId = (req as AuthenticatedRequest).user!.sub;

  const dueSoonTasks = await prisma.task.findMany({
    where: {
      dueDate: {
        lte: new Date(Date.now() + 1000 * 60 * 60 * 24),
        gte: new Date()
      },
      status: {
        not: "COMPLETED"
      },
      assignedTo: userId
    },
    select: { id: true, title: true, dueDate: true }
  });

  if (dueSoonTasks.length) {
    const existing = await prisma.notification.findMany({
      where: { userId, message: { contains: "Deadline Reminder" } },
      select: { message: true }
    });
    const existingMessages = new Set(existing.map((n) => n.message));

    const toCreate = dueSoonTasks
      .map((task) => {
        const message = `Deadline Reminder: "${task.title}" is due on ${new Date(task.dueDate!).toLocaleDateString()}`;
        return { message };
      })
      .filter((item) => !existingMessages.has(item.message));

    if (toCreate.length) {
      await prisma.notification.createMany({
        data: toCreate.map((item) => ({
          userId,
          message: item.message
        }))
      });
    }
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  res.json(notifications);
});

notificationsRouter.patch("/:id/read", async (req, res) => {
  if ((req as AuthenticatedRequest).user?.role === Role.VIEWER) {
    return res.status(403).json({ message: "Viewer has read-only access" });
  }
  const userId = (req as AuthenticatedRequest).user!.sub;
  const notification = await prisma.notification.findFirst({
    where: { id: req.params.id, userId }
  });
  if (!notification) return res.status(404).json({ message: "Notification not found" });

  const updated = await prisma.notification.update({
    where: { id: notification.id },
    data: { isRead: true }
  });
  res.json(updated);
});
