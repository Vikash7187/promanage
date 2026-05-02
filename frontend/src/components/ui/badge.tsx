import { cn } from "@/lib/utils";

type Props = { children: React.ReactNode; className?: string };

export function Badge({ children, className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700",
        className
      )}
    >
      {children}
    </span>
  );
}
