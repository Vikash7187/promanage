"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Search, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth-context";
import { isReadOnlyRole, canManageTasks } from "@/lib/rbac";

type UiStatus = "TO_DO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";

type Task = {
  id: string;
  title: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  dueDate?: string | null;
  projectName: string;
  assignedUser: string;
  status: UiStatus;
};

type ProjectOption = { id: string; title: string };
type UserOption = { id: string; name: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringOrEmpty(value: unknown) {
  return typeof value === "string" ? value : "";
}

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

const columns: Array<{ key: UiStatus; label: string }> = [
  { key: "TO_DO", label: "To Do" },
  { key: "IN_PROGRESS", label: "In Progress" },
  { key: "REVIEW", label: "Review" },
  { key: "COMPLETED", label: "Completed" }
];

const statusToApi = (status: UiStatus) => (status === "TO_DO" ? "TODO" : status);
const apiToStatus = (status?: string): UiStatus => {
  if (status === "TODO") return "TO_DO";
  if (status === "IN_PROGRESS") return "IN_PROGRESS";
  if (status === "REVIEW") return "REVIEW";
  if (status === "COMPLETED") return "COMPLETED";
  return "TO_DO";
};

function TaskCard({ task, disabled, priorityColors }: { task: Task; disabled: boolean; priorityColors: Record<string, string> }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        isDragging ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-slate-900">{task.title}</p>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${priorityColors[task.priority] ?? "bg-slate-100 text-slate-700"}`}>
          {task.priority}
        </span>
      </div>
      <div className="mt-2">
        <span className="inline-flex rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500">{task.projectName}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="grid size-5 place-items-center rounded-full bg-gradient-to-br from-violet-400 to-indigo-400 text-[8px] font-bold text-white">
            {task.assignedUser.slice(0, 1)}
          </div>
          <span>{task.assignedUser}</span>
        </div>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due"}</span>
      </div>
    </div>
  );
}

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} id={id} className="min-h-32 space-y-3 rounded-md">
      {children}
    </div>
  );
}

export default function BoardPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [deadlineFilter, setDeadlineFilter] = useState("ALL");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const [nowMs, setNowMs] = useState<number>(0);
  useEffect(() => {
    const id = setTimeout(() => setNowMs(Date.now()), 0);
    return () => clearTimeout(id);
  }, []);

  type ApiTask = {
    id: unknown;
    title: unknown;
    priority?: unknown;
    dueDate?: unknown;
    status?: unknown;
    project?: unknown;
    assignee?: unknown;
  };

  const isApiTask = (value: unknown): value is ApiTask => isRecord(value) && "id" in value && "title" in value;

  const loadTasks = async () => {
    try {
      const { data } = await api.get("/tasks");
      const mapped: Task[] = (Array.isArray(data) ? data : [])
        .filter(isApiTask)
        .map((task) => {
          const projectName =
            isRecord(task.project) ? toStringOrEmpty(task.project.name) || "General" : "General";
          const assignedUser =
            isRecord(task.assignee) ? toStringOrEmpty(task.assignee.name) || "Unassigned" : "Unassigned";
          const priority = toStringOrEmpty(task.priority) as Task["priority"];
          const dueDate = typeof task.dueDate === "string" ? task.dueDate : null;
          return {
            id: toStringOrEmpty(task.id),
            title: toStringOrEmpty(task.title),
            priority: (["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).includes(priority) ? priority : "MEDIUM",
            dueDate,
            projectName,
            assignedUser,
            status: apiToStatus(typeof task.status === "string" ? task.status : undefined),
          };
        })
        .filter((t) => t.id && t.title);
      setTasks(mapped);
    } catch {
      setTasks([]);
    }
  };

  useEffect(() => {
    const id = setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const projects = useMemo(() => Array.from(new Set(tasks.map((task) => task.projectName))), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.assignedUser.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      const matchesProject = projectFilter === "ALL" || task.projectName === projectFilter;

      const daysUntilDue = task.dueDate
        ? (new Date(task.dueDate).getTime() - nowMs) / (1000 * 60 * 60 * 24)
        : Number.POSITIVE_INFINITY;
      const matchesDeadline =
        deadlineFilter === "ALL" ||
        (deadlineFilter === "TODAY" && daysUntilDue <= 1) ||
        (deadlineFilter === "THIS_WEEK" && daysUntilDue <= 7);

      return matchesSearch && matchesPriority && matchesProject && matchesDeadline;
    });
  }, [deadlineFilter, nowMs, priorityFilter, projectFilter, search, tasks]);

  const tasksByStatus = useMemo(
    () =>
      columns.reduce<Record<UiStatus, Task[]>>(
        (acc, col) => {
          acc[col.key] = filteredTasks.filter((task) => task.status === col.key);
          return acc;
        },
        {
          TO_DO: [],
          IN_PROGRESS: [],
          REVIEW: [],
          COMPLETED: []
        }
      ),
    [filteredTasks]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    if (isReadOnlyRole(user?.role)) return;
    const { active, over } = event;
    if (!over) return;

    const activeTask = tasks.find((task) => task.id === String(active.id));
    if (!activeTask) return;

    const targetColumn = columns.find((col) => col.key === String(over.id))?.key ?? tasks.find((t) => t.id === String(over.id))?.status;
    if (!targetColumn || activeTask.status === targetColumn) return;

    setTasks((prev) =>
      prev.map((task) => (task.id === activeTask.id ? { ...task, status: targetColumn } : task))
    );

    try {
      await api.patch(`/tasks/${activeTask.id}/status`, { status: statusToApi(targetColumn) });
    } catch {
      setTasks((prev) =>
        prev.map((task) => (task.id === activeTask.id ? { ...task, status: activeTask.status } : task))
      );
      toast.error("Could not update task status.");
    }
  };

  const columnColors: Record<UiStatus, string> = {
    TO_DO: "bg-slate-100 text-slate-700",
    IN_PROGRESS: "bg-violet-100 text-violet-700",
    REVIEW: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700"
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-700",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-amber-100 text-amber-700",
    CRITICAL: "bg-red-100 text-red-700"
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Task Board</h2>
          <p className="text-sm text-slate-500">Kanban workflow across your team and sprints.</p>
        </div>
        {canManageTasks(user?.role) && (
          <Button onClick={() => setModalOpen(true)} className="h-10 gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700">
            <Plus className="size-4" />
            New Task
          </Button>
        )}
      </div>

      <Card className="rounded-2xl border-slate-100 p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10" placeholder="Search tasks..." />
          </div>
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700" value={deadlineFilter} onChange={(e) => setDeadlineFilter(e.target.value)}>
            <option value="ALL">All Deadlines</option>
            <option value="TODAY">Due Today</option>
            <option value="THIS_WEEK">Due This Week</option>
          </select>
          <select className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
            <option value="ALL">All Projects</option>
            {projects.map((project) => (
              <option key={project} value={project}>
                {project}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="grid gap-4 xl:grid-cols-4">
          {columns.map((column) => (
            <div key={column.key} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${columnColors[column.key]}`}>
                    {column.label}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-400">{tasksByStatus[column.key].length}</span>
              </div>
              <SortableContext id={column.key} items={tasksByStatus[column.key].map((task) => task.id)} strategy={verticalListSortingStrategy}>
                <DroppableColumn id={column.key}>
                  {tasksByStatus[column.key].map((task) => (
                    <TaskCard key={task.id} task={task} disabled={isReadOnlyRole(user?.role)} priorityColors={priorityColors} />
                  ))}
                </DroppableColumn>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      <CreateTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreated={loadTasks} />
    </div>
  );
}
