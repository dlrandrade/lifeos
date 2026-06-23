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
    <div className="safe-area min-h-screen sm:px-6 sm:py-6">
      <div className="mx-auto max-w-md rounded-[2rem] bg-[var(--shell)] px-5 py-7 sm:px-7 sm:py-9">
        <p className="text-2xl font-bold tracking-tight">lifeOS</p>
        <h1 className="mt-8 text-3xl font-bold leading-tight">Entrar</h1>
        <p className="mt-2 text-sm text-[var(--text-soft)]">
          Hub pessoal de rotina, saude e organizacao.
        </p>

        {params.message ? (
          <div className="mt-6 rounded-2xl bg-[var(--text)] px-4 py-3 text-sm text-white">
            {params.message}
          </div>
        ) : null}

        <div className="mt-8 space-y-4">
          <AuthForm
            title="Entrar"
            description="Acesse seu ambiente pessoal."
            action={signInAction}
            submitLabel="Entrar"
          />
          <AuthForm
            title="Criar conta"
            description="Cadastre um novo acesso."
            action={signUpAction}
            submitLabel="Criar conta"
            includeName
          />
        </div>
      </div>
    </div>
  );
}
