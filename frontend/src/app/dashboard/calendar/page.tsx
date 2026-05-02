"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

type TaskEvent = {
  id: string;
  title: string;
  dueDate: string | null;
  status: string;
};

type ProjectEvent = {
  id: string;
  name: string;
  dueDate: string | null;
  startDate: string | null;
};

type MeetingEvent = {
  id: string;
  title: string;
  date: string;
  type: "meeting";
};

export default function CalendarPage() {
  const [month, setMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [projectEvents, setProjectEvents] = useState<ProjectEvent[]>([]);

  useEffect(() => {
    const loadCalendar = async () => {
      const { data } = await api.get("/calendar");
      setTaskEvents(data.taskEvents ?? []);
      setProjectEvents(data.projectEvents ?? []);
    };
    loadCalendar();
  }, []);

  const meetings = useMemo<MeetingEvent[]>(
    () =>
      projectEvents
        .filter((event) => event.startDate)
        .map((event) => ({
          id: `meeting-${event.id}`,
          title: `${event.name} kickoff`,
          date: event.startDate!,
          type: "meeting"
        })),
    [projectEvents]
  );

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedTasks = useMemo(
    () =>
      taskEvents.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), selectedDate)),
    [selectedDate, taskEvents]
  );

  const selectedMeetings = useMemo(
    () => meetings.filter((meeting) => isSameDay(parseISO(meeting.date), selectedDate)),
    [meetings, selectedDate]
  );

  const getDayItems = (date: Date) => {
    const tasks = taskEvents.filter((task) => task.dueDate && isSameDay(parseISO(task.dueDate), date));
    const dayMeetings = meetings.filter((meeting) => isSameDay(parseISO(meeting.date), date));
    return { tasks, dayMeetings };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calendar</h2>
          <p className="text-sm text-slate-500">Project milestones, task deadlines, and team events.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setMonth((prev) => subMonths(prev, 1))}>
            Prev
          </Button>
          <span className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">{format(month, "MMMM yyyy")}</span>
          <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setMonth((prev) => addMonths(prev, 1))}>
            Next
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <Card className="rounded-2xl border-slate-100 p-4 shadow-sm">
          <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-400">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {monthDays.map((date) => {
              const { tasks, dayMeetings } = getDayItems(date);
              const hasOverdue = tasks.some(
                (task) => task.dueDate && isBefore(parseISO(task.dueDate), new Date()) && task.status !== "COMPLETED"
              );
              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-24 rounded-xl border p-2 text-left transition ${
                    isSameDay(date, selectedDate)
                      ? "border-violet-500 bg-violet-50"
                      : "border-slate-100 bg-white hover:bg-slate-50"
                  } ${!isSameMonth(date, month) ? "opacity-45" : ""}`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">{format(date, "d")}</span>
                    {hasOverdue && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                        overdue
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {tasks.slice(0, 2).map((task) => (
                      <p key={task.id} className="truncate rounded bg-violet-100 px-1.5 py-0.5 text-[10px] text-violet-800">
                        {task.title}
                      </p>
                    ))}
                    {dayMeetings.slice(0, 1).map((meeting) => (
                      <p key={meeting.id} className="truncate rounded bg-amber-100 px-1.5 py-0.5 text-[10px] text-amber-700">
                        {meeting.title}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="rounded-2xl border-slate-100 p-4 shadow-sm">
          <p className="mb-1 font-semibold text-slate-900">Agenda - {format(selectedDate, "PPP")}</p>
          <p className="mb-4 text-xs text-slate-500">Click a date to view tasks and meetings.</p>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Task Deadlines</p>
            {selectedTasks.length ? (
              selectedTasks.map((task) => {
                const overdue = task.dueDate && isBefore(parseISO(task.dueDate), new Date()) && task.status !== "COMPLETED";
                return (
                  <div key={task.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${overdue ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"}`}>{overdue ? "Overdue" : task.status}</span>
                      <span className="text-xs text-slate-400">{task.dueDate ? format(parseISO(task.dueDate), "p") : ""}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-slate-500">No tasks due on this date.</p>
            )}
          </div>

          <div className="mt-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Meeting Schedules</p>
            {selectedMeetings.length ? (
              selectedMeetings.map((meeting) => (
                <div key={meeting.id} className="rounded-xl border border-slate-100 p-3 text-sm">
                  <p className="font-medium text-slate-900">{meeting.title}</p>
                  <p className="text-xs text-slate-400">{format(parseISO(meeting.date), "PPP p")}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No meetings scheduled.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
