import Link from "next/link";

export const metadata = {
  title: "Offline — lst",
  description: "Sem conexao no momento.",
};

export default function OfflinePage() {
  return (
    <div className="grain min-h-screen bg-transparent px-4 py-10 text-foreground md:px-6">
      <div className="soft-card mx-auto max-w-xl rounded-[2rem] p-8 sm:p-12">
        <p className="text-sm uppercase tracking-[0.28em] text-muted">lst</p>
        <h1 className="headline mt-6 text-5xl leading-[0.92]">
          Voce esta offline.
        </h1>
        <p className="mt-6 text-base leading-7 text-muted">
          Algumas paginas ja vistas continuam disponiveis. Quando a conexao
          voltar, sincronizamos automaticamente.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/dashboard"
            className="rounded-[1.5rem] bg-[#161616] px-5 py-3 text-center text-sm font-semibold text-[#f8f3eb]"
          >
            Tentar dashboard
          </Link>
          <Link
            href="/hidratacao"
            className="rounded-[1.5rem] border border-line bg-white/70 px-5 py-3 text-center text-sm font-semibold"
          >
            Hidratacao
          </Link>
        </div>
      </div>
    </div>
  );
}
