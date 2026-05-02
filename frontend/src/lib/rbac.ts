import { Role } from "@/types/auth";

export const canManageProjects = (role?: Role) => role === "ADMIN" || role === "PROJECT_MANAGER";
export const canManageTasks = (role?: Role) => role === "ADMIN" || role === "PROJECT_MANAGER" || role === "TEAM_MEMBER";
export const canAssignUsers = (role?: Role) => role === "ADMIN" || role === "PROJECT_MANAGER";
export const isReadOnlyRole = (role?: Role) => role === "VIEWER";
