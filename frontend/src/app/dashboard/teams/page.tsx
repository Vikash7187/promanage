"use client";

import { Users, UserCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

const teams = [
  { name: "Product Design", members: 6, lead: "Nina Clarke", color: "bg-pink-100 text-pink-600" },
  { name: "Engineering", members: 14, lead: "Arjun Mehta", color: "bg-blue-100 text-blue-600" },
  { name: "Quality Assurance", members: 5, lead: "Maya Roy", color: "bg-emerald-100 text-emerald-600" },
  { name: "DevOps", members: 4, lead: "Oliver Kim", color: "bg-amber-100 text-amber-600" }
];

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Team Management</h2>
        <p className="text-sm text-slate-500">Manage team structure, ownership, and active workloads.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {teams.map((team) => (
          <Card key={team.name} className="rounded-2xl border-slate-100 p-5 shadow-sm transition hover:border-violet-200">
            <div className="mb-4 flex items-center gap-3">
              <div className={`grid size-10 place-items-center rounded-xl ${team.color}`}>
                <Users className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{team.name}</h3>
                <p className="text-xs text-slate-500">{team.members} members</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-3">
              <UserCircle className="size-4 text-slate-400" />
              <span className="text-sm text-slate-600">Lead: <span className="font-medium text-slate-900">{team.lead}</span></span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
