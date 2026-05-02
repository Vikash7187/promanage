import { prisma } from "./prisma";

export const createActivity = async (userId: string, action: string, taskId?: string, projectId?: string) => {
  await prisma.activityLog.create({
    data: {
      userId,
      action,
      taskId,
      projectId
    }
  });
};

export const notifyUsers = async (userIds: string[], message: string) => {
  const uniqueUserIds = Array.from(new Set(userIds));
  if (!uniqueUserIds.length) return;

  await prisma.notification.createMany({
    data: uniqueUserIds.map((userId) => ({
      userId,
      message
    }))
  });
};
