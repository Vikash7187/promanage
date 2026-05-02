"use client";

import { useEffect, useState } from "react";
import { Plus, FolderKanban, MoreHorizontal, Calendar, X, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { canManageProjects } from "@/lib/rbac";
import { toast } from "sonner";

type Project = {
  id: string;
  title: string;
  description: string | null;
  deadline: string | null;
  tasks: { status: string }[];
  manager?: { name: string } | null;
  members?: { user?: { name: string } | null }[];
};

function CreateProjectModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.post("/projects", { title, description, deadline: deadline ? new Date(deadline).toISOString() : undefined });
      toast.success("Project created");
      setTitle("");
      setDescription("");
      setDeadline("");
      onCreated();
      onClose();
    } catch {
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">New Project</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Project title" className="rounded-xl border-slate-200" required />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" className="h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Deadline</label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="rounded-xl border-slate-200" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl border-slate-200">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [nowMs, setNowMs] = useState<number>(0);

  useEffect(() => {
    const id = setTimeout(() => setNowMs(Date.now()), 0);
    return () => clearTimeout(id);
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      void fetchProjects();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const getProgress = (tasks: { status: string }[]) => {
    const total = tasks.length;
    if (!total) return 0;
    const completed = tasks.filter((t) => t.status === "COMPLETED").length;
    return Math.round((completed / total) * 100);
  };

  const getStatus = (deadline: string | null, progress: number) => {
    if (!deadline) return "On Track";
    const daysUntil = (new Date(deadline).getTime() - nowMs) / (1000 * 60 * 60 * 24);
    if (daysUntil < 0 && progress < 100) return "Overdue";
    if (daysUntil <= 3 && progress < 80) return "At Risk";
    return "On Track";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Projects</h2>
          <p className="text-sm text-slate-500">All active and planned delivery streams.</p>
        </div>
        {canManageProjects(user?.role) && (
          <Button onClick={() => setModalOpen(true)} className="h-10 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            <Plus className="size-4" />
            New Project
          </Button>
        )}
      </div>

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
          <FolderKanban className="mx-auto mb-3 size-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-600">No projects yet</p>
          <p className="mt-1 text-xs text-slate-400">Create your first project to get started.</p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {!loading && projects.map((project) => {
          const progress = getProgress(project.tasks);
          const status = getStatus(project.deadline, progress);
          const members = project.members?.map((m) => m.user?.name?.charAt(0) ?? "?").slice(0, 4) ?? [];
          return (
            <Card key={project.id} className="group rounded-2xl border-slate-100 p-5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
              <div className="mb-4 flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-600">
                  <FolderKanban className="size-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${status === "At Risk" || status === "Overdue" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                    {status}
                  </span>
                  <button className="rounded-lg p-1 text-slate-300 opacity-0 transition hover:bg-slate-100 hover:text-slate-500 group-hover:opacity-100">
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              </div>

              <h3 className="mb-1 text-lg font-semibold text-slate-900">{project.title}</h3>
              <p className="mb-4 text-sm text-slate-500">{project.description || "No description"}</p>

              <div className="mb-4">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-semibold text-slate-900">{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {members.map((m, i) => (
                      <div key={i} className="grid size-7 place-items-center rounded-full border-2 border-white bg-gradient-to-br from-violet-400 to-indigo-400 text-[10px] font-bold text-white">
                        {m}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400">{project.tasks.length} tasks</span>
                </div>
                <span className="flex items-center gap-1 text-xs text-slate-400">
                  <Calendar className="size-3" /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : "No deadline"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <CreateProjectModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={fetchProjects} />
    </div>
  );
}
