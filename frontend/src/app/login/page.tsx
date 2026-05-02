import { AuthForm } from "@/components/auth-form";
import { CheckCircle2, FolderKanban, LineChart, ShieldCheck } from "lucide-react";
import { Lock, Globe, Zap, Bell } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* Left Panel */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-900 via-violet-800 to-purple-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-violet-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-72 rounded-full bg-indigo-500/30 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="grid size-8 place-items-center rounded-lg bg-white/20 font-bold text-white">T</div>
              <span className="text-lg font-bold">TaskNest</span>
            </div>
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-center">
            <h1 className="mb-3 text-4xl font-semibold leading-tight">Welcome back!</h1>
            <p className="mb-8 max-w-md text-violet-100">Sign in to continue managing your projects and tasks.</p>

            <div className="mb-8 rounded-2xl border border-white/10 bg-white/10 p-6 backdrop-blur-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2">
                  <FolderKanban className="size-5" />
                </div>
                <div>
                  <p className="font-medium">Project Dashboard</p>
                  <p className="text-xs text-violet-200">Track all your work in one place</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-2 w-3/4 rounded-full bg-white/40" />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { icon: FolderKanban, text: "Organize Work" },
                { icon: LineChart, text: "Track Progress" },
                { icon: ShieldCheck, text: "Secure & Reliable" }
              ].map((item) => (
                <p key={item.text} className="flex items-center gap-3 text-sm text-violet-50">
                  <span className="grid size-8 place-items-center rounded-lg bg-white/10">
                    <item.icon className="size-4" />
                  </span>
                  {item.text}
                </p>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex gap-2">
            <div className="h-2 w-8 rounded-full bg-white" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
            <div className="h-2 w-2 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex flex-col items-center justify-center p-6 md:p-10">
          <AuthForm mode="login" />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-slate-200 bg-white px-6 py-12 md:px-10">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-8 text-center text-xl font-semibold text-slate-900">Why teams love TaskNest?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Lock, title: "Secure & Private", desc: "Enterprise-grade security for your data" },
              { icon: Globe, title: "Access Anywhere", desc: "Work from any device, any location" },
              { icon: Zap, title: "Boost Productivity", desc: "Streamlined workflows that save time" },
              { icon: Bell, title: "Stay Updated", desc: "Real-time notifications and alerts" }
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="mb-3 grid size-10 place-items-center rounded-xl bg-violet-100 text-violet-600">
                  <item.icon className="size-5" />
                </div>
                <h3 className="mb-1 font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
