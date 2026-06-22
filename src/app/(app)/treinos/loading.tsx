import { Dumbbell } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageShell icon={Dumbbell}>
      <InnerCard>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-3 h-3 w-24" />
        <Skeleton className="mt-5 h-20 w-full rounded-2xl" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </InnerCard>
    </PageShell>
  );
}
