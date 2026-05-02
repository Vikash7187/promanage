import { Role } from "@prisma/client";

export interface AuthPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface RefreshPayload {
  sub: string;
}

export interface AuthenticatedRequest extends Express.Request {
  user?: AuthPayload;
}
