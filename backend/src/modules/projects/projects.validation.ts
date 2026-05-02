import { z } from "zod";

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid MongoDB ObjectId");

export const createProjectSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  deadline: z.string().datetime().optional(),
  managerId: objectIdSchema.optional(),
  memberIds: z.array(objectIdSchema).default([])
});
