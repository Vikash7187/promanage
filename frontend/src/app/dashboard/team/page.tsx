"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, Shield, User, MoreHorizontal } from "lucide-react";

const roleColors: Record<string, string> = {
  ADMIN: "bg-rose-50 text-rose-700 border-rose-200",
  PROJECT_MANAGER: "bg-violet-50 text-violet-700 border-violet-200",
  TEAM_MEMBER: "bg-sky-50 text-sky-700 border-sky-200",
  VIEWER: "bg-slate-50 text-slate-700 border-slate-200",
};

const roleLabels: Record<string, string> = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Project Manager",
  TEAM_MEMBER: "Team Member",
  VIEWER: "Viewer",
};

const demoUsers = [
  { id: "1", name: "Alex Chen", email: "alex@tasknest.com", role: "ADMIN" },
  { id: "2", name: "Sarah Kim", email: "sarah@tasknest.com", role: "PROJECT_MANAGER" },
  { id: "3", name: "Mike Ross", email: "mike@tasknest.com", role: "TEAM_MEMBER" },
  { id: "4", name: "Emily Watson", email: "emily@tasknest.com", role: "TEAM_MEMBER" },
  { id: "5", name: "David Park", email: "david@tasknest.com", role: "VIEWER" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function TeamPage() {
  type TeamUser = { id: string; name: string; email: string; role: string };

  function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  function isTeamUser(value: unknown): value is TeamUser {
    if (!isRecord(value)) return false;
    return (
      typeof value.id === "string" &&
      typeof value.name === "string" &&
      typeof value.email === "string" &&
      typeof value.role === "string"
    );
  }

  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users")
      .then((res) => {
        const parsed: TeamUser[] = Array.isArray(res.data) ? res.data.filter(isTeamUser) : [];
        setUsers(parsed.length ? parsed : demoUsers);
      })
      .catch(() => setUsers(demoUsers))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Management</h1>
        <p className="mt-1 text-sm text-slate-500">Manage team members, roles, and permissions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-36 w-full rounded-2xl" />
          ))}

        {!loading && users.map((user) => (
          <Card key={user.id} className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-md shadow-violet-200">
                  {initials(user.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{user.name}</h3>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Badge className={`border text-xs font-medium ${roleColors[user.role] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                <Shield className="mr-1 h-3 w-3" />
                {roleLabels[user.role] || user.role}
              </Badge>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              <span className="truncate">{user.email}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
