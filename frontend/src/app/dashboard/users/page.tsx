"use client";

import { Mail, ShieldCheck, UserCog, User } from "lucide-react";
import { Card } from "@/components/ui/card";

const users = [
  { name: "Aarav Shah", role: "Admin", email: "aarav@tasknest.app", color: "bg-violet-100 text-violet-600" },
  { name: "Nina Clarke", role: "Project Manager", email: "nina@tasknest.app", color: "bg-blue-100 text-blue-600" },
  { name: "Kai Turner", role: "Team Member", email: "kai@tasknest.app", color: "bg-emerald-100 text-emerald-600" },
  { name: "Maya Roy", role: "Team Member", email: "maya@tasknest.app", color: "bg-emerald-100 text-emerald-600" },
  { name: "Liam Reed", role: "Viewer", email: "liam@tasknest.app", color: "bg-slate-100 text-slate-600" }
];

const roleIcons: Record<string, React.ElementType> = {
  Admin: ShieldCheck,
  "Project Manager": UserCog,
  "Team Member": User,
  Viewer: User
};

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Users</h2>
        <p className="text-sm text-slate-500">User directory and workspace access overview.</p>
      </div>
      <div className="grid gap-3">
        {users.map((u) => {
          const Icon = roleIcons[u.role] ?? User;
          return (
            <Card key={u.name} className="flex items-center justify-between rounded-2xl border-slate-100 p-4 shadow-sm">
              <div className="flex items-center gap-4">
                <div className={`grid size-10 place-items-center rounded-xl ${u.color}`}>
                  <Icon className="size-5" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">{u.name}</p>
                  <p className="flex items-center gap-1 text-xs text-slate-400">
                    <Mail className="size-3" /> {u.email}
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{u.role}</span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
