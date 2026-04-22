import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowUpRight, Search } from "lucide-react";
import {
  addWaterLog,
  createAppointment,
  createTask,
  deleteTask,
  toggleTaskForToday,
} from "@/server/actions";
import { modules } from "@/lib/modules";
import { CreateCard } from "@/components/create-card";
import { TaskListCard } from "@/components/task-list-card";

type DashboardPageProps = {
  data: {
    userName: string;
    dateLabel: Date;
    tasks: Array<{ id: string; title: string; completed: boolean }>;
    highlights: Array<{ title: string; value: string; meta: string }>;
    currentBook: { title: string; author: string | null } | null;
    appointments: Array<{ id: string; title: string; startsAt: Date }>;
    waterConsumed: number;
    waterGoal: number;
  };
};

export function DashboardPage({ data }: DashboardPageProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
        <article className="rounded-[2rem] bg-[#f5f1ea] p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-muted">
            {format(data.dateLabel, "dd MMMM yyyy", { locale: ptBR })}
          </p>
          <h2 className="headline mt-4 max-w-2xl text-5xl leading-[0.92] sm:text-6xl">
            E ai, {data.userName}. O que precisa sair do papel hoje?
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted sm:text-base">
            O dashboard reune o foco do dia, o resumo dos modulos e os atalhos para
            registrar tudo em banco.
          </p>

          <TaskListCard
            tasks={data.tasks}
            toggleAction={toggleTaskForToday}
            deleteAction={deleteTask}
          />
        </article>

        <article className="rounded-[2rem] bg-[#161616] p-6 text-[#f7f2eb] sm:p-8">
          <p className="text-sm uppercase tracking-[0.25em] text-white/55">Resumo operacional</p>
          <div className="mt-6 grid gap-4">
            {data.highlights.map((item) => (
              <div
                key={item.title}
                className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">
                  {item.title}
                </p>
                <p className="mt-3 text-2xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-white/62">{item.meta}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <CreateCard
          title="Nova tarefa"
          description="Cria um item recorrente para aparecer no dashboard."
          action={createTask}
          submitLabel="Salvar tarefa"
          fields={[{ name: "title", placeholder: "Ex.: Fazer exame de sangue" }]}
        />
        <CreateCard
          title="Registrar agua"
          description="Grava o consumo imediatamente no banco."
          action={addWaterLog}
          submitLabel="Adicionar agua"
          fields={[{ name: "amountMl", placeholder: "Ex.: 300", type: "number" }]}
        />
        <CreateCard
          title="Novo compromisso"
          description="Agenda um compromisso simples com data e hora."
          action={createAppointment}
          submitLabel="Salvar compromisso"
          fields={[
            { name: "title", placeholder: "Ex.: Consulta cardiologista" },
            { name: "startsAt", placeholder: "Data e hora", type: "datetime-local" },
          ]}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-4">
        {modules
          .filter((module) => module.slug !== "dashboard")
          .map((module, index) => {
            const Icon = module.icon;

            return (
              <article
                key={module.slug}
                className={`rounded-[1.8rem] p-5 ${
                  index % 3 === 0
                    ? "bg-white"
                    : index % 3 === 1
                      ? "bg-[#ebe4d8]"
                      : "bg-[#efe8de]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#161616] text-[#f7f2eb]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted" />
                </div>
                <h3 className="mt-8 text-xl font-semibold">{module.label}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{module.description}</p>
              </article>
            );
          })}
      </section>

      <section className="rounded-[2rem] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-muted">Busca global</p>
            <h3 className="headline mt-2 text-4xl leading-none">Uma camada de entrada unica</h3>
          </div>
          <div className="hidden rounded-full border border-line px-4 py-3 text-sm text-muted lg:flex lg:items-center lg:gap-3">
            <Search className="h-4 w-4" />
            Buscar tarefas, exercicios, livros, filmes e exames
          </div>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-[1.4rem] bg-[#f5f1ea] p-4">
            <p className="text-sm font-semibold">Banco centralizado</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Todos os modulos foram modelados com tabelas base e logs historicos.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[#f5f1ea] p-4">
            <p className="text-sm font-semibold">Rotas iniciais prontas</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Shell de navegacao montado para Dashboard, Treinos, Dieta e demais modulos.
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[#f5f1ea] p-4">
            <p className="text-sm font-semibold">Proximo passo</p>
            <p className="mt-2 text-sm leading-6 text-muted">
              Conectar autenticacao real e expandir CRUD de treino, dieta e saude.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-[1.4rem] bg-[#161616] p-4 text-[#f8f3eb]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Livro atual</p>
            <p className="mt-2 text-lg font-semibold">
              {data.currentBook?.title ?? "Nenhum livro em leitura"}
            </p>
            <p className="text-sm text-white/65">
              {data.currentBook?.author ?? "Cadastre um livro em andamento"}
            </p>
          </div>
          <div className="rounded-[1.4rem] bg-[#161616] p-4 text-[#f8f3eb]">
            <p className="text-xs uppercase tracking-[0.22em] text-white/50">Agenda de hoje</p>
            <div className="mt-2 space-y-2 text-sm text-white/75">
              {data.appointments.length ? (
                data.appointments.map((item) => (
                  <p key={item.id}>
                    {format(item.startsAt, "HH:mm")} • {item.title}
                  </p>
                ))
              ) : (
                <p>Nenhum compromisso futuro registrado.</p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
