import { Role } from "@/types/auth";

export const getRoleRedirectPath = (role: Role) => {
  switch (role) {
    case "ADMIN":
      return "/dashboard/users";
    case "PROJECT_MANAGER":
      return "/dashboard/projects";
    case "TEAM_MEMBER":
      return "/dashboard/my-tasks";
    case "VIEWER":
      return "/dashboard/reports";
    default:
      return "/dashboard";
  }
};
