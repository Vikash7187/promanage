"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Building2, Globe, Mail, Bell, Shield, Palette } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage workspace preferences and account defaults.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="col-span-2 rounded-2xl border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Workspace</h3>
              <p className="text-xs text-slate-500">General workspace settings</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Workspace Name</label>
              <Input defaultValue="TaskNest HQ" className="rounded-xl border-slate-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Timezone</label>
              <Input defaultValue="Asia/Kolkata (UTC+5:30)" className="rounded-xl border-slate-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Notification Email</label>
              <Input defaultValue="ops@tasknest.com" className="rounded-xl border-slate-200" />
            </div>
          </div>

          <div className="my-6 h-px bg-slate-100" />

          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Localization</h3>
              <p className="text-xs text-slate-500">Language and regional settings</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Language</label>
              <Input defaultValue="English (US)" className="rounded-xl border-slate-200" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Date Format</label>
              <Input defaultValue="MM/DD/YYYY" className="rounded-xl border-slate-200" />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 text-white shadow-lg shadow-violet-200 hover:from-violet-700 hover:to-indigo-700">
              Save Changes
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Bell className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-500">Email and push preferences</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Security</h3>
                <p className="text-xs text-slate-500">2FA and password settings</p>
              </div>
            </div>
          </Card>

          <Card className="rounded-2xl border-slate-200/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Appearance</h3>
                <p className="text-xs text-slate-500">Theme and display options</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
