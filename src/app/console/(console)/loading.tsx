import { Loader2 } from "lucide-react";

export default function ConsoleLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-7 w-44 animate-pulse rounded-[5px] bg-surface-3" />
        <div className="h-9 w-32 animate-pulse rounded-[5px] bg-surface-3" />
      </div>
      <div className="overflow-hidden rounded-[5px] border border-line bg-white">
        <div className="h-11 border-b border-line bg-surface-2" />
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0">
            <div className="h-4 w-1/4 animate-pulse rounded bg-surface-3" />
            <div className="h-4 w-1/5 animate-pulse rounded bg-surface-3" />
            <div className="h-4 flex-1 animate-pulse rounded bg-surface-3" />
          </div>
        ))}
      </div>
      <p className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Loading
      </p>
    </div>
  );
}
