import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { createClient } from "@/lib/supabase/server";
import { signInAction, signUpAction } from "@/server/auth-actions";

type LoginPageProps = {
  searchParams: Promise<{
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="grain min-h-screen bg-transparent px-4 py-6 text-foreground md:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[1.1fr_0.9fr]">
        <section className="soft-card rounded-[2rem] p-8 sm:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-muted">lst</p>
          <h1 className="headline mt-6 max-w-3xl text-6xl leading-[0.88]">
            Rotina, saude e memoria pessoal sob a mesma interface.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-muted">
            O acesso agora usa Supabase Auth. Cada usuario enxerga seus proprios
            dados e o app cria a estrutura inicial automaticamente no primeiro login.
          </p>

          {params.message ? (
            <div className="mt-8 rounded-[1.5rem] bg-[#161616] px-5 py-4 text-sm text-[#f8f3eb]">
              {params.message}
            </div>
          ) : null}

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-sm font-semibold">Supabase Auth</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Sessao SSR e cookies sincronizados.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-sm font-semibold">Banco real</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Dados persistidos no Supabase Postgres.
              </p>
            </div>
            <div className="rounded-[1.5rem] bg-white/70 p-4">
              <p className="text-sm font-semibold">Perfil automatico</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Estrutura minima criada no primeiro acesso.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4">
          <AuthForm
            title="Entrar"
            description="Acesse seu ambiente pessoal do lst."
            action={signInAction}
            submitLabel="Entrar"
          />
          <AuthForm
            title="Criar conta"
            description="Cadastre um novo acesso para usar o app com seus dados."
            action={signUpAction}
            submitLabel="Criar conta"
            includeName
          />
        </section>
      </div>
    </div>
  );
}
