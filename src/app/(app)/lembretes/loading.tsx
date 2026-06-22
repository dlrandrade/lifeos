import { Bell } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { Skeleton } from "@/components/skeleton";

export default function Loading() {
  return (
    <PageShell icon={Bell}>
      <InnerCard>
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </InnerCard>
    </PageShell>
  );
}
