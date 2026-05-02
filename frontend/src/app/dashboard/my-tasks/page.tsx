"use client";

import { useEffect, useState } from "react";
import { CheckSquare, Calendar, MoreHorizontal, Plus, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { canManageTasks } from "@/lib/rbac";
import { toast } from "sonner";

type MyTaskItem = {
  id: string;
  title: string;
  status: string;
  dueDate?: string;
  priority?: string;
  project?: { title: string };
  assignee?: { name: string };
};

type ProjectOption = { id: string; title: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMyTaskItem(value: unknown): value is MyTaskItem {
  if (!isRecord(value)) return false;
  return typeof value.id === "string" && typeof value.title === "string";
}

const statusStyles: Record<string, string> = {
  "TODO": "bg-slate-100 text-slate-700",
  "IN_PROGRESS": "bg-violet-100 text-violet-700",
  "REVIEW": "bg-amber-100 text-amber-700",
  "COMPLETED": "bg-emerald-100 text-emerald-700"
};

const priorityStyles: Record<string, string> = {
  "LOW": "bg-slate-50 text-slate-500",
  "MEDIUM": "bg-blue-50 text-blue-600",
  "HIGH": "bg-amber-50 text-amber-600",
  "CRITICAL": "bg-red-50 text-red-600"
};

function formatDueDate(dueDate: string | undefined): string {
  if (!dueDate) return "No due date";
  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays <= 7) return `${diffDays} days`;
  return date.toLocaleDateString();
}

function CreateTaskModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!open) return;
    const fetchProjects = async () => {
      setFetching(true);
      try {
        const { data } = await api.get("/projects");
        const parsed: ProjectOption[] = Array.isArray(data) 
          ? data.filter((p: unknown) => isRecord(p)).map((p: unknown) => ({
            id: String((p as Record<string, unknown>).id),
            title: String((p as Record<string, unknown>).title)
          })).filter((p: ProjectOption) => p.id && p.title)
          : [];
        setProjects(parsed);
      } catch {
        toast.error("Failed to load projects");
      } finally {
        setFetching(false);
      }
    };
    fetchProjects();
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
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      });
      toast.success("Task created");
      setTitle("");
      setDescription("");
      setProjectId("");
      setPriority("MEDIUM");
      setDueDate("");
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
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" className="rounded-xl border-slate-200" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="h-20 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400" />
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
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Due Date</label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-xl border-slate-200" />
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

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<MyTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchMyTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get("/dashboard");
      const data: unknown = res.data;
      if (isRecord(data) && Array.isArray(data.myTasks)) {
        const filtered = data.myTasks.filter(isMyTaskItem);
        setTasks(filtered);
      } else {
        setTasks([]);
      }
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Tasks</h2>
          <p className="text-sm text-slate-500">Your assigned items, deadlines, and current status.</p>
        </div>
        {canManageTasks(user?.role) && (
          <Button onClick={() => setModalOpen(true)} className="h-10 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            <Plus className="size-4" />
            New Task
          </Button>
        )}
      </div>

      <div className="grid gap-3">
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-2xl" />
        ))}
        
        {!loading && tasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
            <CheckSquare className="mx-auto mb-3 size-10 text-slate-300" />
            <p className="text-sm font-medium text-slate-600">No tasks assigned</p>
            <p className="mt-1 text-xs text-slate-400">Tasks assigned to you will appear here.</p>
          </div>
        )}
        
{!loading && tasks.map((task) => {
          const displayStatus = task.status?.replace("_", " ") || "To Do";
          const displayPriority = task.priority || "MEDIUM";
          return (
            <Card key={task.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-slate-100 p-4 shadow-sm transition hover:border-violet-200">
              <div className="flex items-center gap-4">
                <div className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-600">
                  <CheckSquare className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400">{task.project?.title || "No project"}</p>
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Calendar className="size-3" /> Due {formatDueDate(task.dueDate)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${priorityStyles[displayPriority] || "bg-slate-50 text-slate-500"}`}>{displayPriority}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[task.status] || "bg-slate-100 text-slate-700"}`}>{displayStatus}</span>
                <button className="rounded-lg p-1 text-slate-300 hover:bg-slate-100 hover:text-slate-500">
                  <MoreHorizontal className="size-4" />
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <CreateTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchMyTasks} />
    </div>
  );
}
