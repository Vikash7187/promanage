"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingUp, Target, Users, Clock } from "lucide-react";

const velocityData = [
  { week: "W1", completed: 21, planned: 24 },
  { week: "W2", completed: 25, planned: 26 },
  { week: "W3", completed: 22, planned: 24 },
  { week: "W4", completed: 29, planned: 30 },
  { week: "W5", completed: 27, planned: 28 },
  { week: "W6", completed: 31, planned: 30 },
];

const taskDistribution = [
  { name: "Design", tasks: 12 },
  { name: "Frontend", tasks: 24 },
  { name: "Backend", tasks: 18 },
  { name: "QA", tasks: 14 },
  { name: "DevOps", tasks: 8 },
];

const metrics = [
  { label: "Sprint Velocity", value: "28.5", change: "+12%", icon: TrendingUp, color: "bg-emerald-50 text-emerald-600" },
  { label: "Tasks Completed", value: "154", change: "+8%", icon: Target, color: "bg-violet-50 text-violet-600" },
  { label: "Team Utilization", value: "87%", change: "+3%", icon: Users, color: "bg-sky-50 text-sky-600" },
  { label: "Avg. Cycle Time", value: "3.2d", change: "-0.5d", icon: Clock, color: "bg-amber-50 text-amber-600" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">Monitor delivery quality, velocity, and operational metrics.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <Card key={m.label} className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${m.color}`}>
                <m.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{m.label}</p>
                <p className="text-lg font-bold text-slate-900">{m.value}</p>
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-emerald-600">{m.change} from last sprint</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="rounded-2xl border-slate-200/60 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Sprint Velocity</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={velocityData}>
              <defs>
                <linearGradient id="planned" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="completed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6d28d9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6d28d9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Area dataKey="planned" type="monotone" stroke="#8b5cf6" strokeWidth={2} fill="url(#planned)" />
              <Area dataKey="completed" type="monotone" stroke="#6d28d9" strokeWidth={2} fill="url(#completed)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="rounded-2xl border-slate-200/60 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">Tasks by Team</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={taskDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
              <Bar dataKey="tasks" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
