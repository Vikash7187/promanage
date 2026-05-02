"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      aria-label="Toggle theme"
      className="grid size-10 place-items-center rounded-md border border-violet-200 bg-white text-violet-700 transition hover:bg-violet-50 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
