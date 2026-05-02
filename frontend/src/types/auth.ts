export type Role = "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER" | "VIEWER";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
