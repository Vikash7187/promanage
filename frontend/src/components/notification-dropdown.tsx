"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";

type NotificationItem = {
  id: string;
  title: string;
  body: string;
  read: boolean;
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

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);

  const load = async () => {
    const { data } = await api.get("/notifications");
    const parsed: NotificationItem[] = Array.isArray(data)
      ? data.filter(isNotificationItem)
      : [];
    setItems(parsed);
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

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  return (
    <div className="relative">
      <button
        aria-label="Open notifications"
        aria-expanded={open}
        className="relative grid size-10 place-items-center rounded-md border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Bell className="size-5" />
        {unreadCount > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-violet-600" />}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-30 w-80 rounded-lg border border-violet-100 bg-white p-2 shadow-lg dark:border-violet-900 dark:bg-violet-950">
          <div className="mb-2 flex items-center justify-between border-b border-violet-100 p-2">
            <p className="text-sm font-semibold text-violet-950">Notifications</p>
            <span className="text-xs text-violet-500">{unreadCount} unread</span>
          </div>
          <div className="max-h-80 space-y-2 overflow-auto p-1">
            {items.slice(0, 8).map((item) => (
              <button
                key={item.id}
                className={`w-full rounded-md border p-2 text-left transition hover:bg-violet-50 ${
                  item.read ? "border-violet-50" : "border-violet-200 bg-violet-50/40"
                }`}
                onClick={async () => {
                  if (!item.read) await api.patch(`/notifications/${item.id}/read`);
                  void load();
                }}
              >
                <p className="text-sm font-medium text-violet-900">{item.title}</p>
                <p className="text-xs text-violet-600">{item.body}</p>
              </button>
            ))}
            {!items.length && <p className="p-2 text-sm text-violet-500">No notifications yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
