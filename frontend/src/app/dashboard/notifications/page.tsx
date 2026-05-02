"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { toast } from "sonner";
import { Bell, CheckCheck, AlertTriangle, Info, MessageSquare, Clock } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  type?: string;
  createdAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNotificationItem(value: unknown): value is NotificationItem {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    typeof value.read === "boolean" &&
    typeof value.createdAt === "string"
  );
}

const iconMap: Record<string, React.ReactNode> = {
  alert: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
  message: <MessageSquare className="h-5 w-5 text-violet-500" />,
  reminder: <Clock className="h-5 w-5 text-pink-500" />,
  default: <Bell className="h-5 w-5 text-slate-400" />,
};

const bgMap: Record<string, string> = {
  alert: "bg-amber-50",
  info: "bg-sky-50",
  message: "bg-violet-50",
  reminder: "bg-pink-50",
  default: "bg-slate-50",
};

const demoItems: NotificationItem[] = [
  { id: "1", title: "Task overdue: API Documentation", body: "This task is now 2 days past due.", read: false, type: "alert", createdAt: "2026-05-01T19:30:00.000Z" },
  { id: "2", title: "New comment on Phoenix v2", body: "Sarah Kim left a comment on the design task.", read: false, type: "message", createdAt: "2026-05-01T18:00:00.000Z" },
  { id: "3", title: "Sprint review tomorrow", body: "Sprint 24 review is scheduled for 10:00 AM.", read: true, type: "reminder", createdAt: "2026-05-01T16:00:00.000Z" },
  { id: "4", title: "Weekly report generated", body: "Your team performance report is ready.", read: true, type: "info", createdAt: "2026-05-01T12:00:00.000Z" },
];

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    try {
      const res = await api.get("/notifications");
      const parsed: NotificationItem[] = Array.isArray(res.data) ? res.data.filter(isNotificationItem) : [];
      setItems(parsed.length ? parsed : demoItems);
    } catch {
      setItems(demoItems);
    }
    setLoading(false);
  };

  useEffect(() => {
    const id = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(id);
  }, []);

  const unreadCount = items.filter((i) => !i.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="rounded-xl"
            onClick={async () => {
              try {
                await api.patch("/notifications/read-all");
                toast.success("All notifications marked as read.");
                void load();
              } catch {
                toast.error("Unable to update notifications.");
              }
            }}
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all read
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-24 w-full rounded-2xl" />
          ))}

        {!loading && !items.length && (
          <EmptyState title="No notifications yet" description="Task alerts and reminders will appear here." />
        )}

        {!loading && items.map((item) => (
          <Card
            key={item.id}
            className={`flex items-start gap-4 rounded-2xl border-slate-200/60 p-5 shadow-sm transition-all hover:shadow-md ${
              !item.read ? "bg-white" : "bg-slate-50/60"
            }`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bgMap[item.type || "default"] || bgMap.default}`}>
              {iconMap[item.type || "default"] || iconMap.default}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${!item.read ? "text-slate-900" : "text-slate-600"}`}>
                {item.title}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{item.body}</p>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            {!item.read && (
              <Button
                variant="ghost"
                className="shrink-0 rounded-lg text-xs text-slate-500 hover:text-violet-600"
                onClick={async () => {
                  try {
                    await api.patch(`/notifications/${item.id}/read`);
                    toast.success("Marked as read.");
                    void load();
                  } catch {
                    toast.error("Unable to update notification.");
                  }
                }}
              >
                Mark read
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
