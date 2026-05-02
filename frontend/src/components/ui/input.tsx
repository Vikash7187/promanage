import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      suppressHydrationWarning
      className={cn(
        "flex h-10 w-full rounded-md border border-violet-200 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-violet-300 focus:border-violet-500 focus-visible:ring-2 focus-visible:ring-violet-500/30 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-100",
        className
      )}
      {...props}
    />
  );
}
