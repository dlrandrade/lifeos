// Bloco de carregamento minimalista, on-brand. Ver PROJECT.md secao 3 (UI).
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-[var(--check)]/50 ${className}`} />
  );
}
