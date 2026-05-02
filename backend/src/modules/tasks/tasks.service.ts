import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { createActivity, notifyUsers } from "../../lib/events";

export const listTasksService = async (userId: string, role: Role) => {
  const where =
    role === "TEAM_MEMBER"
      ? { assignedTo: userId }
      : {};

  return prisma.task.findMany({
    where,
    include: { assignee: true, project: true },
    orderBy: { createdAt: "desc" }
  });
};

export const createTaskService = async (data: any, actorId: string) => {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      projectId: data.projectId,
      createdBy: actorId,
      assignedTo: data.assigneeId || null
    },
    include: { assignee: true, project: true }
  });

  await createActivity(actorId, `User created task "${task.title}"`, task.id, task.projectId);
  if (data.assigneeId && data.assigneeId !== actorId) {
    await notifyUsers(
      [data.assigneeId],
      `You have been assigned "${task.title}" in project ${task.project.title}.`
    );
  }

  return task;
};

export const updateTaskService = async (id: string, data: any, actorId: string) => {
  const previous = await prisma.task.findUnique({
    where: { id },
    include: { assignee: true, project: true }
  });

  const updateData: any = {
    title: data.title,
    description: data.description,
    status: data.status,
    priority: data.priority,
    dueDate: data.dueDate ? new Date(data.dueDate) : undefined
  };
  if (data.assigneeId !== undefined) updateData.assignedTo = data.assigneeId || null;

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { assignee: true, project: true }
  });

  if (previous && data.status && previous.status !== data.status) {
    await createActivity(actorId, `Status changed for "${task.title}" to ${String(data.status).replace("_", " ")}`, task.id, task.projectId);
    if (task.assignedTo && task.assignedTo !== actorId) {
      await notifyUsers(
        [task.assignedTo],
        `"${task.title}" moved to ${String(data.status).replace("_", " ")}.`
      );
    }
  }

  if (previous && data.assigneeId && data.assigneeId !== previous.assignedTo) {
    await notifyUsers(
      [data.assigneeId],
      `You have been assigned "${task.title}" in project ${task.project.title}.`
    );
  }

  if (previous && data.dueDate && previous.dueDate?.toISOString() !== new Date(data.dueDate).toISOString()) {
    if (task.assignedTo && task.assignedTo !== actorId) {
      await notifyUsers(
        [task.assignedTo],
        `Due date for "${task.title}" is ${new Date(data.dueDate).toLocaleDateString()}.`
      );
    }
  }

  if (previous && data.status === "COMPLETED" && previous.status !== "COMPLETED") {
    await createActivity(actorId, `Task completed "${task.title}"`, task.id, task.projectId);
  }

  return task;
};

export const deleteTaskService = async (id: string) => {
  return prisma.task.delete({ where: { id } });
};
