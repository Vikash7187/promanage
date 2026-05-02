"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Target, TrendingUp, Calendar } from "lucide-react";

const timeData = [
  { project: "Phoenix v2", planned: 240, logged: 198, billable: true },
  { project: "Platform", planned: 160, logged: 142, billable: true },
  { project: "Mercury Labs", planned: 120, logged: 85, billable: true },
  { project: "Internal", planned: 80, logged: 45, billable: false },
  { project: "QA & Testing", planned: 40, logged: 8, billable: false },
];

const totalPlanned = timeData.reduce((s, t) => s + t.planned, 0);
const totalLogged = timeData.reduce((s, t) => s + t.logged, 0);
const totalBillable = timeData.filter((t) => t.billable).reduce((s, t) => s + t.logged, 0);

export default function TimeTrackingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Time Tracking</h1>
        <p className="mt-1 text-sm text-slate-500">Track billed and non-billed hours per team and project.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Hours Logged</p>
              <p className="text-xl font-bold text-slate-900">{totalLogged}h</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Billable Hours</p>
              <p className="text-xl font-bold text-slate-900">{totalBillable}h</p>
            </div>
          </div>
        </Card>
        <Card className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Utilization</p>
              <p className="text-xl font-bold text-slate-900">{Math.round((totalLogged / totalPlanned) * 100)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden rounded-2xl border-slate-200/60 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h3 className="font-semibold text-slate-900">Project Hours</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {timeData.map((item) => {
            const pct = Math.round((item.logged / item.planned) * 100);
            return (
              <div key={item.project} className="px-6 py-5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-900">{item.project}</span>
                    <Badge className="border border-slate-200 bg-white text-[10px] font-normal text-slate-500">
                      {item.billable ? "Billable" : "Non-billable"}
                    </Badge>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {item.logged}h / {item.planned}h
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-500">{pct}% of planned hours</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
