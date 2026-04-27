"use client";

import { useEffect } from "react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[lifeOS] page error", error);
  }, [error]);

  return (
    <div className="rounded-[2rem] bg-[var(--shell)] px-6 py-8 sm:px-8 sm:py-10">
      <p className="text-2xl font-bold tracking-tight">lifeOS</p>
      <h1 className="mt-6 text-2xl font-bold leading-tight">
        Algo travou aqui.
      </h1>
      <p className="mt-2 text-sm text-[var(--text-soft)]">
        A operacao nao completou. O resto do app continua funcionando.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          ref: {error.digest}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => reset()}
        className="mt-6 rounded-full bg-[var(--text)] px-4 py-2 text-sm font-semibold text-white"
      >
        Tentar de novo
      </button>
    </div>
  );
}
