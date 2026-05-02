import { Priority, TaskStatus } from "@prisma/client";
import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const createTaskSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  projectId: objectIdSchema,
  dueDate: z.string().datetime().optional(),
  priority: z.nativeEnum(Priority).default(Priority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TODO),
  assigneeId: objectIdSchema.optional()
});
