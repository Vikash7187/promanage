import { Inbox } from "lucide-react";

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="grid place-items-center rounded-lg border border-dashed border-violet-200 p-8 text-center dark:border-violet-800">
      <Inbox className="mb-2 size-6 text-violet-400" />
      <p className="font-medium text-violet-900 dark:text-violet-100">{title}</p>
      <p className="mt-1 text-sm text-violet-500">{description}</p>
    </div>
  );
}
