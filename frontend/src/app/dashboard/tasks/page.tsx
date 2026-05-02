"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Flag, FolderKanban, MoreHorizontal, Plus, X, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { canManageTasks } from "@/lib/rbac";
import { toast } from "sonner";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOrEmpty(value: unknown) {
  return typeof value === "string" ? value : "";
}

const priorityColors: Record<string, string> = {
  HIGH: "bg-rose-50 text-rose-700 border-rose-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  LOW: "bg-sky-50 text-sky-700 border-sky-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const statusColors: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-700",
  IN_PROGRESS: "bg-violet-50 text-violet-700",
  REVIEW: "bg-amber-50 text-amber-700",
  COMPLETED: "bg-emerald-50 text-emerald-700",
};

type ProjectOption = { id: string; title: string };
type UserOption = { id: string; name: string };

function CreateTaskModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchOptions = async () => {
      setFetching(true);
      try {
        const [projectsRes, usersRes] = await Promise.all([api.get("/projects"), api.get("/users")]);
        const projectsData: unknown = projectsRes.data;
        const usersData: unknown = usersRes.data;

        const nextProjects: ProjectOption[] = Array.isArray(projectsData)
          ? projectsData
              .filter(isRecord)
              .map((p) => ({
                id: toStringOrEmpty(p.id),
                title: toStringOrEmpty(p.title || p.name),
              }))
              .filter((p) => p.id && p.title)
          : [];

        const nextUsers: UserOption[] = Array.isArray(usersData)
          ? usersData
              .filter(isRecord)
              .map((u) => ({
                id: toStringOrEmpty(u.id),
                name: toStringOrEmpty(u.name),
              }))
              .filter((u) => u.id && u.name)
          : [];

        setProjects(nextProjects);
        setUsers(nextUsers);
      } catch {
        toast.error("Failed to load options");
      } finally {
        setFetching(false);
      }
    };

    void fetchOptions();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !projectId) return;
    setLoading(true);
    try {
      await api.post("/tasks", {
        title,
        description,
        projectId,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        assigneeId: assigneeId || undefined,
      });
      toast.success("Task created");
      setTitle("");
      setDescription("");
      setProjectId("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">New Task</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
        {fetching ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="rounded-xl border-slate-200" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Project *</label>
                <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400">
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl border-slate-200" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assignee</label>
                <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-violet-400">
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-slate-200">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Create Task"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const { user } = useAuth();
  type ApiTask = {
    id: unknown;
    title: unknown;
    priority?: unknown;
    status?: unknown;
    dueDate?: unknown;
    project?: unknown;
  };
  const isApiTask = (value: unknown): value is ApiTask => isRecord(value) && "id" in value && "title" in value;

  type UiTask = {
    id: string;
    title: string;
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
    dueDate?: string | null;
    projectName: string;
  };

  const [tasks, setTasks] = useState<UiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/tasks");
      const mapped: UiTask[] = (Array.isArray(data) ? data : [])
        .filter(isApiTask)
        .map((task) => {
          const priority = toStringOrEmpty(task.priority) as UiTask["priority"];
          const status = toStringOrEmpty(task.status) as UiTask["status"];
          const projectName = isRecord(task.project) ? toStringOrEmpty(task.project.name) || "No project" : "No project";
          const dueDate = typeof task.dueDate === "string" ? task.dueDate : null;
          return {
            id: toStringOrEmpty(task.id),
            title: toStringOrEmpty(task.title),
            priority: (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).includes(priority) ? priority : "MEDIUM",
            status: (["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"] as const).includes(status) ? status : "TODO",
            dueDate,
            projectName,
          };
        })
        .filter((t) => t.id && t.title);
      setTasks(mapped);
    } catch {
      toast.error("Failed to load tasks");
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchTasks();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">All Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">View and manage tasks across all projects.</p>
        </div>
        {canManageTasks(user?.role) && (
          <Button onClick={() => setModalOpen(true)} className="h-10 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            <Plus className="size-4" />
            New Task
          </Button>
        )}
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Task List</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {loading &&
            Array.from({ length: 5 }).map((_, idx) => (
              <Skeleton key={idx} className="h-20 w-full" />
            ))}

          {!loading && tasks.length === 0 && (
            <div className="py-12 text-center">
              <CheckCircle2 className="mx-auto mb-3 size-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">No tasks yet</p>
              <p className="mt-1 text-xs text-slate-400">Create a task to get started.</p>
            </div>
          )}

          {!loading && tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <FolderKanban className="h-3 w-3" />
                    {task.projectName}
                  </span>
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`border text-xs font-medium ${priorityColors[task.priority] || "border-slate-200 bg-slate-50 text-slate-700"}`}>
                  <Flag className="mr-1 h-3 w-3" />
                  {task.priority}
                </Badge>
                <Badge className={`text-xs font-medium ${statusColors[task.status] || "bg-slate-100 text-slate-700"}`}>
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      <CreateTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchTasks} />
    </div>
  );
}
