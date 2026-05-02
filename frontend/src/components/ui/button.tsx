import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost";
};

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      suppressHydrationWarning
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
        variant === "default" &&
          "bg-violet-700 text-white hover:bg-violet-600 shadow-sm hover:shadow dark:bg-violet-600 dark:hover:bg-violet-500",
        variant === "outline" &&
          "border border-violet-200 bg-white text-violet-700 hover:bg-violet-50 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-200 dark:hover:bg-violet-900",
        variant === "ghost" && "text-violet-700 hover:bg-violet-100 dark:text-violet-200 dark:hover:bg-violet-900",
        className
      )}
      {...props}
    />
  );
}
