"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCircle2, Plus, FileUp, MessageSquare, GitPullRequest } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";

type ActivityItem = {
  id: string;
  action: string;
  createdAt: string;
  user?: { name?: string };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isActivityItem(value: unknown): value is ActivityItem {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.action !== "string") return false;
  if (typeof value.createdAt !== "string") return false;
  if (value.user !== undefined && value.user !== null && !isRecord(value.user)) return false;
  return true;
}

function getActivityIcon(action: string) {
  if (action.includes("completed")) return { icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" };
  if (action.includes("created")) return { icon: Plus, color: "bg-blue-100 text-blue-600" };
  if (action.includes("uploaded")) return { icon: FileUp, color: "bg-amber-100 text-amber-600" };
  if (action.includes("commented")) return { icon: MessageSquare, color: "bg-violet-100 text-violet-600" };
  return { icon: GitPullRequest, color: "bg-slate-100 text-slate-600" };
}

export function ActivityFeedPanel() {
  const [feed, setFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/activity");
      const parsed: ActivityItem[] = Array.isArray(data) ? data.filter(isActivityItem) : [];
      setFeed(parsed);
    } catch {
      setFeed([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const kick = () => {
      void load();
    };

    const id = setTimeout(kick, 0);
    const interval = setInterval(kick, 15000);
    return () => {
      clearTimeout(id);
      clearInterval(interval);
    };
  }, []);

  const demoFeed: ActivityItem[] = [
    { id: "1", action: "Ava moved 2 tasks to Review in Phoenix", createdAt: "2026-05-01T20:10:00.000Z", user: { name: "Ava Watson" } },
    { id: "2", action: "Liam created project: Orion Insights", createdAt: "2026-05-01T18:50:00.000Z", user: { name: "Liam Reed" } },
    { id: "3", action: "Noah completed task TSK-188", createdAt: "2026-05-01T17:45:00.000Z", user: { name: "Noah Clark" } },
    { id: "4", action: "Mia uploaded file to Mercury Mobile", createdAt: "2026-05-01T16:30:00.000Z", user: { name: "Mia Torres" } },
    { id: "5", action: "James commented on TSK-204", createdAt: "2026-05-01T15:10:00.000Z", user: { name: "James Wilson" } },
    { id: "6", action: "Sarah completed task TSK-195", createdAt: "2026-05-01T13:20:00.000Z", user: { name: "Sarah Chen" } }
  ];

  const displayFeed = feed.length ? feed : demoFeed;

  return (
    <Card className="h-fit rounded-2xl border-slate-100 p-5 shadow-sm">
      <h3 className="mb-4 font-semibold text-slate-900">Activity Feed</h3>
      <div className="max-h-[700px] space-y-3 overflow-auto pr-1">
        {loading && Array.from({ length: 5 }).map((_, idx) => <Skeleton key={idx} className="h-16 w-full" />)}
        {!loading && !displayFeed.length && (
          <EmptyState title="No activity yet" description="Task and project updates will show up here." />
        )}
        {!loading && displayFeed.slice(0, 12).map((item) => {
          const { icon: Icon, color } = getActivityIcon(item.action);
          return (
            <div key={item.id} className="flex gap-3 rounded-xl p-2 transition hover:bg-slate-50">
              <div className={`grid size-9 shrink-0 place-items-center rounded-lg ${color}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-slate-800">{item.action}</p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {item.user?.name ?? "User"} - {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
