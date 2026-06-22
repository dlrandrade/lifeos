import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="safe-area fixed inset-0 bg-[var(--bg)] sm:p-5 flex overflow-hidden">
      <div className="mx-auto flex w-full max-w-[768px] flex-col rounded-[2rem] bg-[var(--shell)] px-5 py-6 sm:px-7 sm:py-8 shadow-sm overflow-hidden">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-6 h-9 w-3/4" />
        <Skeleton className="mt-2 h-9 w-1/2" />
        <div className="mt-8 flex-1 space-y-4">
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-7 w-3/5" />
        </div>
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-28 w-[140px] rounded-[1.5rem]" />
          <Skeleton className="h-28 w-[140px] rounded-[1.5rem]" />
          <Skeleton className="h-28 w-[140px] rounded-[1.5rem]" />
        </div>
      </div>
    </div>
  );
}
