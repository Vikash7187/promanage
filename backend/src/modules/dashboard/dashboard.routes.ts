import { Router } from "express";
import { ProjectStatus, TaskStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middlewares/auth.middleware";

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get("/", async (_req, res) => {
  const now = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [
    totalProjects,
    totalTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
    groupedTasks,
    weeklyCreated,
    weeklyCompleted,
    recentActivity,
    myTasks,
    upcomingDeadlines,
    activeProjects,
    teamWorkload
  ] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: TaskStatus.IN_PROGRESS } }),
    prisma.task.count({ where: { status: TaskStatus.COMPLETED } }),
    prisma.task.count({
      where: { dueDate: { lt: now }, status: { not: TaskStatus.COMPLETED } }
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: { status: true }
    }),
    prisma.task.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: weekAgo } },
      _count: { id: true }
    }),
    prisma.task.count({
      where: { status: TaskStatus.COMPLETED, createdAt: { gte: weekAgo } }
    }),
    prisma.activityLog.findMany({
      include: { user: { select: { name: true } }, task: { select: { title: true } }, project: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.task.findMany({
      where: { status: { not: TaskStatus.COMPLETED } },
      include: { assignee: { select: { name: true } }, project: { select: { title: true } } },
      orderBy: { dueDate: "asc" },
      take: 10
    }),
    prisma.task.findMany({
      where: { dueDate: { gte: now }, status: { not: TaskStatus.COMPLETED } },
      include: { assignee: { select: { name: true } }, project: { select: { title: true } } },
      orderBy: { dueDate: "asc" },
      take: 5
    }),
    prisma.project.findMany({
      where: { status: { not: ProjectStatus.ARCHIVED } },
      include: { members: { include: { user: { select: { name: true } } } }, tasks: true, manager: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10
    }),
    prisma.user.findMany({
      select: { id: true, name: true, role: true, tasks: { where: { status: TaskStatus.COMPLETED } } }
    })
  ]);

  const workload = teamWorkload.map((user) => ({
    id: user.id,
    name: user.name,
    role: user.role,
    completedTasks: user.tasks.length
  }));

  res.json({
    totalProjects,
    totalTasks,
    inProgress: inProgressTasks,
    completed: completedTasks,
    overdue: overdueTasks,
    progressAnalytics: groupedTasks,
    weeklyOverview: { created: weeklyCreated.length, completed: weeklyCompleted },
    teamWorkload: workload,
    recentActivity,
    myTasks,
    upcomingDeadlines,
    activeProjects
  });
});
