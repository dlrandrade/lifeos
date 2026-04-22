"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { modules } from "@/lib/modules";
import { SignOutButton } from "@/components/sign-out-button";

type AppShellProps = { children: React.ReactNode };

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="grain min-h-screen bg-transparent px-4 py-4 text-foreground md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="soft-card hidden rounded-[2rem] p-6 md:flex md:flex-col">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">lst</p>
            <h1 className="headline mt-4 text-5xl leading-none">curadoria do dia</h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted">
              Rotina, saude e memoria pessoal em um unico lugar.
            </p>
          </div>

          <nav className="space-y-2">
            {modules.map((module) => {
              const href = `/${module.slug}`;
              const isActive = pathname === href;
              const Icon = module.icon;

              return (
                <Link
                  key={module.slug}
                  href={href}
                  className={`flex items-center justify-between rounded-[1.5rem] px-4 py-3 transition ${
                    isActive
                      ? "bg-accent text-[#f8f3eb]"
                      : "bg-white/45 text-foreground hover:bg-white/70"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-semibold">{module.label}</span>
                  </span>
                  <span
                    className={`text-[10px] uppercase tracking-[0.22em] ${
                      isActive ? "text-white/70" : "text-muted"
                    }`}
                  >
                    {module.shortLabel}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-[1.75rem] bg-[#161616] p-5 text-[#f8f3eb]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/55">
              Estrutura pronta
            </p>
            <p className="headline mt-3 text-3xl leading-none">Prisma + Next.js</p>
            <p className="mt-3 text-sm leading-6 text-white/72">
              Base inicial pronta para receber autenticacao, migrations e dados reais.
            </p>
          </div>
        </aside>

        <div className="soft-card flex min-h-full flex-col rounded-[2rem]">
          <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 md:px-8">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted">lst</p>
              <p className="text-sm text-muted">Hub pessoal de rotina e saude</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-3 rounded-full border border-line bg-white/70 px-4 py-2 text-sm text-muted sm:flex">
                <Search className="h-4 w-4" />
                Buscar tarefas, livros, filmes, remedios...
              </div>
              <SignOutButton />
            </div>
          </header>

          <main className="flex-1 px-4 py-4 md:px-8 md:py-8">{children}</main>

          <nav className="sticky bottom-0 grid grid-cols-5 gap-2 border-t border-line bg-[#f6f2eb]/88 px-3 py-3 backdrop-blur md:hidden">
            {modules.slice(0, 5).map((module) => {
              const href = `/${module.slug}`;
              const Icon = module.icon;
              const isActive = pathname === href;

              return (
                <Link
                  key={module.slug}
                  href={href}
                  className={`flex flex-col items-center rounded-2xl px-2 py-2 text-[11px] ${
                    isActive ? "bg-[#161616] text-[#f8f3eb]" : "text-muted"
                  }`}
                >
                  <Icon className="mb-1 h-4 w-4" />
                  {module.shortLabel}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
