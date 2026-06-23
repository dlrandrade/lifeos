import Link from "next/link";

export const metadata = {
  title: "Offline — lifeOS",
  description: "Sem conexao no momento.",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-[2rem] bg-[var(--shell)] px-6 py-10 sm:px-10">
        <p className="text-2xl font-bold tracking-tight">lifeOS</p>
        <h1 className="mt-6 text-3xl font-bold leading-tight">
          Voce esta offline.
        </h1>
        <p className="mt-4 text-sm leading-6 text-[var(--text-soft)]">
          Algumas paginas ja vistas continuam disponiveis. Quando a conexao
          voltar, sincronizamos automaticamente.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 rounded-full bg-[var(--text)] px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Tentar novamente
          </Link>
        </div>
      </div>
    </div>
  );
}
