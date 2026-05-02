"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  PlusCircle,
  FileUp,
  MessageCircle,
  Clock,
  Activity,
} from "lucide-react";

type ActivityItem = {
  id: string;
  message: string;
  createdAt: string;
  action?: string;
  actor?: { name?: string };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isActivityItem(value: unknown): value is ActivityItem {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string") return false;
  if (typeof value.message !== "string") return false;
  if (typeof value.createdAt !== "string") return false;
  if (value.actor !== undefined && value.actor !== null && !isRecord(value.actor)) return false;
  return true;
}

const iconMap: Record<string, React.ReactNode> = {
  completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  created: <PlusCircle className="h-5 w-5 text-violet-500" />,
  updated: <Clock className="h-5 w-5 text-amber-500" />,
  uploaded: <FileUp className="h-5 w-5 text-sky-500" />,
  commented: <MessageCircle className="h-5 w-5 text-pink-500" />,
  default: <Activity className="h-5 w-5 text-slate-400" />,
};

const demoFeed: ActivityItem[] = [
  { id: "1", message: "Completed task \"API Integration\"", actor: { name: "Alex Chen" }, createdAt: "2026-05-01T20:30:00.000Z", action: "completed" },
  { id: "2", message: "Created project \"Phoenix v2\"", actor: { name: "Sarah Kim" }, createdAt: "2026-05-01T20:00:00.000Z", action: "created" },
  { id: "3", message: "Uploaded file \"QA Signoff.pdf\"", actor: { name: "Mike Ross" }, createdAt: "2026-05-01T19:00:00.000Z", action: "uploaded" },
  { id: "4", message: "Commented on \"Dashboard Design\"", actor: { name: "Emily Watson" }, createdAt: "2026-05-01T18:00:00.000Z", action: "commented" },
  { id: "5", message: "Updated task status to In Review", actor: { name: "Alex Chen" }, createdAt: "2026-05-01T17:00:00.000Z", action: "updated" },
];

export default function ActivityPage() {
  const [feed, setFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/activity")
      .then((res) => {
        const parsed: ActivityItem[] = Array.isArray(res.data) ? res.data.filter(isActivityItem) : [];
        setFeed(parsed.length ? parsed : demoFeed);
      })
      .catch(() => setFeed(demoFeed))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Activity Feed</h1>
        <p className="mt-1 text-sm text-slate-500">Track all project and team activity in real time.</p>
      </div>

      <div className="space-y-3">
        {loading &&
          Array.from({ length: 5 }).map((_, idx) => (
            <Skeleton key={idx} className="h-20 w-full rounded-2xl" />
          ))}

        {!loading && feed.map((item) => (
          <Card key={item.id} className="flex items-start gap-4 rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              {iconMap[item.action || "default"] || iconMap.default}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {item.actor?.name} &middot; {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
