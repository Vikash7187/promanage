import { Router } from "express";
import { Role, TaskStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate, authorize } from "../../middlewares/auth.middleware";

export const usersRouter = Router();

usersRouter.use(authenticate);
usersRouter.get("/", authorize(Role.ADMIN, Role.PROJECT_MANAGER), async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true }
  });
  res.json(users);
});

usersRouter.get("/team", authenticate, async (_req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      role: true,
      tasks: { select: { status: true } }
    }
  });

  const team = users.map((user) => {
    const total = user.tasks.length;
    const completed = user.tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      totalTasks: total,
      completedTasks: completed,
      completionRate
    };
  });

  res.json(team);
});

usersRouter.patch("/:id/role", authorize(Role.ADMIN), async (req, res) => {
  const { role } = req.body as { role: Role };
  const user = await prisma.user.update({
    where: { id: String(req.params.id) },
    data: { role }
  });
  res.json(user);
});
