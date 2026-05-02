import { prisma } from "../../lib/prisma";
import { Role } from "@prisma/client";
import { createActivity, notifyUsers } from "../../lib/events";

export const listProjectsService = async (userId: string, role: Role) => {
  const where =
    role === "TEAM_MEMBER"
      ? {
          OR: [
            { managerId: userId },
            { members: { some: { userId } } },
            { tasks: { some: { assignedTo: userId } } }
          ]
        }
      : {};

  return prisma.project.findMany({
    where,
    include: { manager: true, members: { include: { user: true } }, tasks: true },
    orderBy: { createdAt: "desc" }
  });
};

export const createProjectService = async (data: any, actorId: string, role: Role) => {
  const managerId = role === "PROJECT_MANAGER" ? actorId : data.managerId ?? actorId;
  const project = await prisma.project.create({
    data: {
      title: data.title,
      description: data.description,
      deadline: data.deadline ? new Date(data.deadline) : null,
      managerId,
      createdBy: actorId,
      members: { create: data.memberIds?.map((userId: string) => ({ userId })) }
    },
    include: { manager: true, members: { include: { user: true } } }
  });

  await createActivity(actorId, `User created project "${project.title}"`, undefined, project.id);
  await notifyUsers(
    (data.memberIds ?? []).filter((id: string) => id !== actorId),
    `You have been added to project "${project.title}".`
  );

  return project;
};

export const updateProjectService = async (id: string, data: any, actorId: string) => {
  const project = await prisma.project.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      deadline: data.deadline ? new Date(data.deadline) : undefined,
      managerId: data.managerId,
      ...(data.memberIds
        ? {
            members: {
              deleteMany: {},
              create: data.memberIds.map((userId: string) => ({ userId }))
            }
          }
        : {})
    },
    include: { manager: true, members: { include: { user: true } }, tasks: true }
  });

  await createActivity(actorId, `User updated project "${project.title}"`, undefined, project.id);

  return project;
};

export const deleteProjectService = async (id: string) => {
  return prisma.project.delete({ where: { id } });
};
