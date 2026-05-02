import { Router } from "express";
import { prisma } from "../../lib/prisma";
import { authenticate } from "../../middlewares/auth.middleware";

export const activityRouter = Router();

activityRouter.use(authenticate);
activityRouter.get("/", async (_req, res) => {
  const feed = await prisma.activityLog.findMany({
    include: { user: { select: { name: true } }, task: { select: { title: true } }, project: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
    take: 50
  });
  res.json(feed);
});
