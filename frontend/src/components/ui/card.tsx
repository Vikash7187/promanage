import * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl border border-violet-100 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-violet-900 dark:bg-violet-950/70",
        className
      )}
      {...props}
    />
  );
}
