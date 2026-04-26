import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type PageShellProps = {
  icon?: LucideIcon;
  hideLogo?: boolean;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
};

export function PageShell({ icon: Icon, hideLogo, rightSlot, children }: PageShellProps) {
  return (
    <div className="rounded-[2rem] bg-[var(--shell)] px-5 py-6 sm:px-7 sm:py-8 shadow-sm">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" aria-label="Dashboard" className="flex items-center">
          {Icon ? <Icon className="h-7 w-7" strokeWidth={1.7} /> : null}
        </Link>
        {hideLogo ? (
          rightSlot ?? null
        ) : (
          <Link
            href="/dashboard"
            aria-label="lst"
            className="text-2xl font-bold tracking-tight"
          >
            lst
          </Link>
        )}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

export function InnerCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[1.5rem] bg-[var(--card)] px-5 py-6 sm:px-7 sm:py-8 ${className}`}
    >
      {children}
    </div>
  );
}
