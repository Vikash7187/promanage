"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  CalendarDays,
  Menu,
  Clock3,
  Building2,
  FileText,
  UserCog,
  ShieldCheck,
  Settings,
  KanbanSquare,
  Search,
  Plus,
  LogOut,
  User,
  ChevronDown,
  Bell,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import { canManageProjects } from "@/lib/rbac";

function getGreeting(name?: string) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${timeGreeting}, ${name.split(" ")[0]}!` : `${timeGreeting}!`;
}

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: string[];
};

type NavSection = {
  title: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { href: "/dashboard", label: "Home", icon: LayoutDashboard },
      { href: "/dashboard/my-tasks", label: "My Tasks", icon: CheckSquare },
      { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
      { href: "/dashboard/board", label: "Board", icon: KanbanSquare },
      { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/dashboard/time-tracking", label: "Time Tracking", icon: Clock3 }
    ]
  },
  {
    title: "MANAGEMENT",
    items: [
      { href: "/dashboard/teams", label: "Teams", icon: Users, roles: ["ADMIN", "PROJECT_MANAGER"] },
      { href: "/dashboard/clients", label: "Clients", icon: Building2 },
      { href: "/dashboard/reports", label: "Reports", icon: FileText },
      { href: "/dashboard/documents", label: "Documents", icon: FileText }
    ]
  },
  {
    title: "ADMIN",
    items: [
      { href: "/dashboard/users", label: "Users", icon: UserCog, roles: ["ADMIN", "PROJECT_MANAGER"] },
      { href: "/dashboard/roles-permissions", label: "Roles & Permissions", icon: ShieldCheck, roles: ["ADMIN"] },
      { href: "/dashboard/settings", label: "Settings", icon: Settings }
    ]
  }
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const visibleSections = useMemo(
    () =>
      sections
        .map((section) => ({
          ...section,
          items: section.items.filter(
            (item) => !item.roles || !item.roles.length || (user ? item.roles.includes(user.role) : false)
          )
        }))
        .filter((section) => section.items.length > 0),
    [user]
  );

  const currentPage = useMemo(() => {
    for (const section of visibleSections) {
      const found = section.items.find((item) => item.href === pathname);
      if (found) return found.label;
    }
    return "Workspace";
  }, [pathname, visibleSections]);

  const sideNav = (
    <aside className="flex h-full flex-col bg-gradient-to-b from-indigo-950 via-indigo-900 to-slate-900 p-5 text-white">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-sm font-bold shadow-lg">T</div>
        <span className="text-xl font-bold tracking-tight">TaskNest</span>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-indigo-300/70">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-indigo-100/80 transition-all duration-200 hover:bg-white/10 hover:text-white",
                    pathname === item.href && "bg-white/15 font-medium text-white shadow-sm"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold">
            {user?.name?.slice(0, 2).toUpperCase() ?? "TN"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{user?.name ?? "TaskNest User"}</p>
            <p className="truncate text-xs text-indigo-300/70">{user?.role?.replace("_", " ") ?? "Member"}</p>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push("/login");
            }}
            className="rounded-md p-1.5 text-indigo-300/70 transition hover:bg-white/10 hover:text-white"
            title="Logout"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <div className="hidden lg:block">{sideNav}</div>

        <div className="flex min-h-screen flex-col">
          {/* Top Navbar */}
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex items-center gap-4">
              <button
                className="grid size-10 place-items-center rounded-xl border border-slate-200 bg-white lg:hidden"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5 text-slate-600" />
              </button>

              <div className="hidden flex-1 md:block">
                <h1 className="text-lg font-semibold text-slate-900">{getGreeting(user?.name)}</h1>
                <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening with your projects today.</p>
              </div>

              <div className="flex-1 md:hidden">
                <h1 className="text-base font-semibold text-slate-900">{currentPage}</h1>
              </div>

              <div className="relative hidden max-w-md flex-1 lg:block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm" placeholder="Search tasks, projects, reports..." />
              </div>

              {canManageProjects(user?.role) && (
                <Button className="hidden gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 md:inline-flex">
                  <Plus className="size-4" />
                  <span className="hidden xl:inline">New</span>
                </Button>
              )}

              <button className="relative grid size-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50">
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-red-500 ring-2 ring-white" />
              </button>

              <div className="relative">
                <button
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1 pr-3 transition hover:bg-slate-50"
                  onClick={() => setProfileOpen((prev) => !prev)}
                >
                  <span className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white">
                    {user?.name?.slice(0, 2).toUpperCase() ?? "TN"}
                  </span>
                  <ChevronDown className="size-4 text-slate-500" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-12 z-20 w-56 rounded-xl border border-slate-100 bg-white p-2 shadow-xl">
                    <div className="mb-2 border-b border-slate-100 p-2">
                      <p className="text-sm font-semibold text-slate-900">{user?.name ?? "TaskNest User"}</p>
                      <p className="text-xs text-slate-500">{user?.email ?? "user@tasknest.app"}</p>
                    </div>
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/dashboard/settings");
                      }}
                    >
                      <User className="size-4" />
                      Profile
                    </button>
                    <button
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      onClick={async () => {
                        setProfileOpen(false);
                        await logout();
                        router.push("/login");
                      }}
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button className="absolute inset-0 bg-slate-900/50" onClick={() => setMenuOpen(false)} />
          <div className="relative h-full w-[280px]">
            {sideNav}
            <button
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg bg-white/10 text-white transition hover:bg-white/20"
              onClick={() => setMenuOpen(false)}
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
