"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const roleAccessMap: Record<string, Array<string>> = {
  "/dashboard/users": ["ADMIN", "PROJECT_MANAGER"],
  "/dashboard/teams": ["ADMIN", "PROJECT_MANAGER"],
  "/dashboard/roles-permissions": ["ADMIN"],
  "/dashboard/reports": ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "VIEWER"],
  "/dashboard/projects": ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "VIEWER"],
  "/dashboard/board": ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER", "VIEWER"],
  "/dashboard/my-tasks": ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"]
};

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    const protectedPath = Object.keys(roleAccessMap).find((route) => pathname.startsWith(route));
    if (!protectedPath) return;

    const allowedRoles = roleAccessMap[protectedPath];
    if (!allowedRoles.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [loading, pathname, router, user]);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-sm text-violet-600">Loading workspace...</div>;
  }

  if (!user) return null;
  return <>{children}</>;
}
