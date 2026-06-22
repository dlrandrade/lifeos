import { Droplets } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageShell icon={Droplets}>
      <InnerCard>
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-6 h-10 w-32" />
        <Skeleton className="mt-3 h-2 w-full rounded-full" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-9 w-full rounded-full" />
          <Skeleton className="h-9 w-full rounded-full" />
        </div>
        <div className="mt-8 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </InnerCard>
    </PageShell>
  );
}
