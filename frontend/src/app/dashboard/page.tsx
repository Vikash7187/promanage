"use client";

import { useEffect, useState } from "react";
import {
  FolderKanban,
  ListChecks,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Plus,
  Calendar,
  ArrowUpRight
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityFeedPanel } from "@/components/activity-feed-panel";
import { api } from "@/lib/api";

type DashboardData = {
  totalProjects: number;
  totalTasks: number;
  inProgress: number;
  completed: number;
  overdue: number;
  progressAnalytics: { status: string; _count: { status: number } }[];
  weeklyOverview: { created: number; completed: number };
  teamWorkload: { id: string; name: string; role: string; completedTasks: number }[];
  myTasks: { id: string; title: string; status: string; dueDate?: string; priority?: string; project?: { title: string }; assignee?: { name: string } }[];
  upcomingDeadlines: { id: string; title: string; dueDate: string; project?: { title: string }; assignee?: { name: string } }[];
  activeProjects: { id: string; title: string; deadline?: string; status: string; tasks: { status: string }[]; members?: { user?: { name: string } }[]; manager?: { name: string } }[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDashboardData(value: unknown): value is DashboardData {
  if (!isRecord(value)) return false;
  return typeof value.totalProjects === "number";
}

const statusColorsMap: Record<string, { color: string; bgClass: string }> = {
  TODO: { color: "#94a3b8", bgClass: "bg-slate-100 text-slate-700" },
  IN_PROGRESS: { color: "#8b5cf6", bgClass: "bg-violet-100 text-violet-700" },
  REVIEW: { color: "#f59e0b", bgClass: "bg-amber-100 text-amber-700" },
  COMPLETED: { color: "#10b981", bgClass: "bg-emerald-100 text-emerald-700" }
};

const priorityColorsMap: Record<string, string> = {
  LOW: "bg-slate-50 text-slate-500",
  MEDIUM: "bg-blue-50 text-blue-600",
  HIGH: "bg-amber-50 text-amber-600",
  CRITICAL: "bg-red-50 text-red-600"
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    "TODO": "bg-slate-100 text-slate-700",
    "IN_PROGRESS": "bg-violet-100 text-violet-700",
    "REVIEW": "bg-amber-100 text-amber-700",
    "COMPLETED": "bg-emerald-100 text-emerald-700"
  };
  const displayStatus = status.replace("_", " ");
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] ?? "bg-slate-100 text-slate-700"}`}>{displayStatus}</span>;
}

function PriorityBadge({ priority }: { priority: string }) {
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityColorsMap[priority] ?? "bg-slate-50 text-slate-500"}`}>{priority}</span>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard");
        if (isDashboardData(res.data)) {
          setData(res.data);
        }
      } catch {
        // Handle error silently, show empty state
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Prepare chart data from API
  const statusData = data?.progressAnalytics?.map((item) => {
    const statusInfo = statusColorsMap[item.status] || { color: "#94a3b8" };
    return {
      name: item.status.replace("_", " "),
      value: item._count?.status || 0,
      color: statusInfo.color
    };
  }) || [
    { name: "To Do", value: 0, color: "#94a3b8" },
    { name: "In Progress", value: 0, color: "#8b5cf6" },
    { name: "Review", value: 0, color: "#f59e0b" },
    { name: "Completed", value: 0, color: "#10b981" }
  ];

  const totalTaskCount = statusData.reduce((sum, s) => sum + s.value, 0) || 1;
  const overviewData = [
    { day: "Mon", created: data?.weeklyOverview?.created ? Math.round(data.weeklyOverview.created / 7 * 2) : 0, completed: data?.weeklyOverview?.completed ? Math.round(data.weeklyOverview.completed / 7 * 2) : 0 },
    { day: "Tue", created: data?.weeklyOverview?.created ? Math.round(data.weeklyOverview.created / 7 * 3) : 0, completed: data?.weeklyOverview?.completed ? Math.round(data.weeklyOverview.completed / 7 * 3) : 0 },
    { day: "Wed", created: data?.weeklyOverview?.created ? Math.round(data.weeklyOverview.created / 7 * 2.5) : 0, completed: data?.weeklyOverview?.completed ? Math.round(data.weeklyOverview.completed / 7 * 2.5) : 0 },
    { day: "Thu", created: data?.weeklyOverview?.created || 0, completed: data?.weeklyOverview?.completed || 0 },
    { day: "Fri", created: 0, completed: 0 },
    { day: "Sat", created: 0, completed: 0 },
    { day: "Sun", created: 0, completed: 0 }
  ];

  const teamWorkload = data?.teamWorkload?.map((user) => ({
    name: user.name,
    role: user.role,
    completion: user.completedTasks > 0 ? Math.min(100, user.completedTasks * 10) : 0
  })) || [];

  const myTasks = data?.myTasks?.slice(0, 5).map((task) => ({
    id: task.id,
    title: task.title,
    project: task.project?.title || "No project",
    status: task.status,
    due: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date",
    priority: task.priority || "MEDIUM"
  })) || [];

  const upcomingDeadlines = data?.upcomingDeadlines?.slice(0, 4).map((task) => {
    const dueDate = new Date(task.dueDate);
    const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return {
      title: task.title,
      date: dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      daysLeft,
      assignee: task.assignee?.name?.charAt(0) || "?"
    };
  }) || [];

  const activeProjects = data?.activeProjects?.map((project) => {
    const tasks = project.tasks || [];
    const completed = tasks.filter((t: { status: string }) => t.status === "COMPLETED").length;
    const total = tasks.length || 1;
    const progress = Math.round((completed / total) * 100);
    const members = project.members?.map((m) => m.user?.name?.charAt(0) || "?").slice(0, 4) || [];
    return {
      name: project.title,
      id: project.id,
      members,
      progress,
      tasksCompleted: `${completed}/${total}`,
      due: project.deadline ? new Date(project.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "No deadline",
      status: project.status === "ARCHIVED" ? "Completed" : "On Track"
    };
  }) || [];

  const metrics = [
    { label: "Total Projects", value: String(data?.totalProjects ?? 0), change: data?.totalProjects ? "+0%" : "+0%", up: true, icon: FolderKanban, color: "bg-violet-100 text-violet-600" },
    { label: "Total Tasks", value: String(data?.totalTasks ?? 0), change: data?.totalTasks ? "+0%" : "+0%", up: true, icon: ListChecks, color: "bg-blue-100 text-blue-600" },
    { label: "In Progress", value: String(data?.inProgress ?? 0), change: "+0%", up: true, icon: Loader2, color: "bg-amber-100 text-amber-600" },
    { label: "Completed", value: String(data?.completed ?? 0), change: "+0%", up: true, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
    { label: "Overdue", value: String(data?.overdue ?? 0), change: data?.overdue ? "-0%" : "-0%", up: false, icon: AlertTriangle, color: "bg-red-100 text-red-600" }
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        {/* Metric Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metrics.map((m) => (
            <Card key={m.label} className="rounded-2xl border-slate-100 p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div className={`grid size-10 place-items-center rounded-xl ${m.color}`}>
                  <m.icon className="size-5" />
                </div>
                <div className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${m.up ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  {m.up ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                  {m.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{m.value}</p>
              <p className="mt-0.5 text-sm text-slate-500">{m.label}</p>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 xl:grid-cols-[1fr_1.8fr]">
          <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Project Progress</h3>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={4} stroke="none">
                  {statusData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {statusData.map((s) => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <span className="size-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-slate-600">{s.name}</span>
                  <span className="ml-auto font-medium text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">Task Overview</h3>
              <select className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                <option>This Week</option>
                <option>Last Week</option>
                <option>This Month</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={overviewData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                <Line type="monotone" dataKey="created" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 3, fill: "#8b5cf6" }} name="Created" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: "#10b981" }} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* My Tasks + Upcoming Deadlines + Team Workload */}
        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900">My Tasks</h3>
              <Button className="h-8 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-3 text-xs text-white">
                <Plus className="mr-1 size-3.5" /> New
              </Button>
            </div>
            <div className="space-y-3">
              {myTasks.map((task) => (
                <div key={task.id} className="group rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition hover:border-violet-200 hover:bg-violet-50/30">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-400">{task.id}</p>
                      <p className="text-sm font-medium text-slate-900">{task.title}</p>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                    <span>{task.project}</span>
                    <span className="flex items-center gap-1"><Calendar className="size-3" /> {task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">Upcoming Deadlines</h3>
            <div className="space-y-3">
              {upcomingDeadlines.map((d) => (
                <div key={d.title} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white">
                    <span className="text-xs font-bold">{d.date.split(" ")[0]}</span>
                    <span className="text-[10px] leading-none">{d.date.split(" ")[1]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{d.title}</p>
                    <p className="text-xs text-slate-500">{d.daysLeft} days left</p>
                  </div>
                  <div className="grid size-8 place-items-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {d.assignee}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-slate-900">Team Workload</h3>
            <div className="space-y-4">
              {teamWorkload.map((member) => (
                <div key={member.name}>
                  <div className="mb-1.5 flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium text-slate-900">{member.name}</span>
                      <span className="ml-2 text-xs text-slate-400">{member.role}</span>
                    </div>
                    <span className="font-semibold text-slate-700">{member.completion}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                      style={{ width: `${member.completion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Active Projects Table */}
        <Card className="rounded-2xl border-slate-100 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Active Projects</h3>
            <Button variant="ghost" className="h-8 px-2 text-sm text-violet-600 hover:text-violet-700">
              View All <ArrowUpRight className="ml-1 size-4" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-3 font-medium">Project</th>
                  <th className="pb-3 font-medium">Team</th>
                  <th className="pb-3 font-medium">Progress</th>
                  <th className="pb-3 font-medium">Tasks</th>
                  <th className="pb-3 font-medium">Due Date</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {activeProjects.map((project) => (
                  <tr key={project.name} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                    <td className="py-3 font-medium text-slate-900">{project.name}</td>
                    <td className="py-3">
                      <div className="flex -space-x-2">
                        {project.members.map((m, i) => (
                          <div key={i} className="grid size-7 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-indigo-400 text-[10px] font-bold text-white">
                            {m}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${project.progress}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{project.tasksCompleted}</td>
                    <td className="py-3 text-slate-600">{project.due}</td>
                    <td className="py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${project.status === "At Risk" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                        <MoreHorizontal className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <ActivityFeedPanel />
    </div>
  );
}
