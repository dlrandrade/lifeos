import type { LucideIcon } from "lucide-react";

// Estado vazio minimalista e consistente do nucleo. Ver PROJECT.md secao 3 (UI).
export function EmptyState({
  icon: Icon,
  title,
  hint,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 py-10 text-center ${className}`}
    >
      {Icon ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-muted)]">
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
      ) : null}
      <p className="text-sm font-semibold text-[var(--text-soft)]">{title}</p>
      {hint ? <p className="text-xs text-[var(--text-muted)]">{hint}</p> : null}
    </div>
  );
}
