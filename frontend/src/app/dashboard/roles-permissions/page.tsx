"use client";

import { Check, X, ShieldCheck, Users, UserCheck, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";

const roles = [
  {
    key: "ADMIN",
    title: "Admin",
    description: "Full system access and control",
    icon: ShieldCheck,
    color: "bg-violet-100 text-violet-600",
    permissions: [true, true, true, true, true, true]
  },
  {
    key: "PROJECT_MANAGER",
    title: "Project Manager",
    description: "Manage projects, tasks, and teams",
    icon: Users,
    color: "bg-blue-100 text-blue-600",
    permissions: [true, true, true, false, true, false]
  },
  {
    key: "TEAM_MEMBER",
    title: "Team Member",
    description: "Execute assigned tasks and collaborate",
    icon: UserCheck,
    color: "bg-amber-100 text-amber-600",
    permissions: [false, true, false, false, false, false]
  },
  {
    key: "VIEWER",
    title: "Viewer",
    description: "Read-only access to projects and reports",
    icon: Eye,
    color: "bg-slate-100 text-slate-600",
    permissions: [false, false, true, false, false, false]
  }
];

const permissionsList = [
  "Create Projects",
  "Manage Tasks",
  "View Reports",
  "Manage Users",
  "Manage Settings",
  "Delete Data"
];

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Roles & Permissions</h2>
        <p className="text-sm text-slate-500">Role matrix for enterprise-grade access control.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {roles.map((role) => (
          <Card key={role.key} className="rounded-2xl border-slate-100 p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className={`grid size-10 place-items-center rounded-xl ${role.color}`}>
                <role.icon className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{role.title}</h3>
                <p className="text-xs text-slate-500">{role.description}</p>
              </div>
            </div>
            <div className="space-y-2">
              {permissionsList.map((perm, i) => (
                <div key={perm} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <span className="text-sm text-slate-600">{perm}</span>
                  {role.permissions[i] ? (
                    <Check className="size-4 text-emerald-500" />
                  ) : (
                    <X className="size-4 text-slate-300" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
        <h3 className="mb-4 font-semibold text-slate-900">Permission Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 font-medium text-slate-400">Permission</th>
                {roles.map((role) => (
                  <th key={role.key} className="pb-3 font-medium text-slate-700">{role.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsList.map((perm, i) => (
                <tr key={perm} className="border-b border-slate-50">
                  <td className="py-3 text-slate-700">{perm}</td>
                  {roles.map((role) => (
                    <td key={role.key} className="py-3">
                      {role.permissions[i] ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                          <Check className="size-3" /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-400">
                          <X className="size-3" /> Denied
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
