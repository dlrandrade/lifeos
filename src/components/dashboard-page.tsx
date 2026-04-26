import Link from "next/link";
import { BookOpen, Dumbbell, Pencil, Plus, Search, Trash2, Utensils } from "lucide-react";
import { CheckButton } from "@/components/check-button";
import {
  createTask,
  deleteTask,
  toggleTaskForToday,
  updateTask,
} from "@/server/actions";
import { PageShell } from "@/components/page-shell";

type DashboardPageProps = {
  data: {
    userName: string;
    tasks: Array<{ id: string; title: string; completed: boolean }>;
    todayWorkoutTitle: string | null;
    currentBookTitle: string | null;
    currentBookAuthor: string | null;
    nextMealTitle: string | null;
  };
};

export function DashboardPage({ data }: DashboardPageProps) {
  return (
    <PageShell hideLogo rightSlot={<span className="text-2xl font-bold tracking-tight">lst</span>}>
      <h1 className="mt-8 text-4xl leading-[1.1] tracking-tight sm:text-5xl">
        <span className="text-[var(--text-soft)]">E ai, {data.userName},</span>
        <br />
        <span className="font-bold">Muita coisa pra fazer hoje? Que tal comecar agora?</span>
      </h1>

      <div className="mt-10 space-y-4">
        {data.tasks.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            Sem tarefas ainda. Adicione abaixo.
          </p>
        ) : null}

        {data.tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <CheckButton
                action={toggleTaskForToday}
                hiddenFields={{ taskId: task.id }}
                checked={task.completed}
                ariaLabel={task.completed ? "Desmarcar tarefa" : "Concluir tarefa"}
              />
              <span
                className={`truncate text-lg ${
                  task.completed
                    ? "text-[var(--text-muted)] line-through"
                    : "text-[var(--text-soft)]"
                }`}
              >
                {task.title}
              </span>
            </div>

            <details className="relative">
              <summary className="list-none cursor-pointer text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
                <Pencil className="h-4 w-4" strokeWidth={1.7} />
              </summary>
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
                <form action={updateTask} className="space-y-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <input
                    name="title"
                    defaultValue={task.title}
                    required
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
                  >
                    Salvar
                  </button>
                </form>
                <form action={deleteTask} className="mt-2">
                  <input type="hidden" name="taskId" value={task.id} />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                  >
                    <Trash2 className="h-3 w-3" /> Excluir
                  </button>
                </form>
              </div>
            </details>
          </div>
        ))}

        <form action={createTask} className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            aria-label="Adicionar tarefa"
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--check)] text-white"
          >
            <Plus className="h-4 w-4" strokeWidth={3} />
          </button>
          <input
            name="title"
            placeholder="Adicionar tarefa..."
            required
            className="flex-1 bg-transparent text-base text-[var(--text-soft)] placeholder:text-[var(--text-muted)] outline-none"
          />
        </form>
      </div>

      <div className="mt-10 grid grid-cols-3 gap-3">
        <ModuleCard
          href="/treinos"
          icon={<Dumbbell className="h-5 w-5" strokeWidth={1.7} />}
          title="Treino"
          subtitle={data.todayWorkoutTitle ?? "de hoje"}
        />
        <ModuleCard
          href="/livros"
          icon={<BookOpen className="h-5 w-5" strokeWidth={1.7} />}
          title={data.currentBookTitle ?? "Livros"}
          subtitle={data.currentBookAuthor ?? "leitura atual"}
        />
        <ModuleCard
          href="/dieta"
          icon={<Utensils className="h-5 w-5" strokeWidth={1.7} />}
          title={data.nextMealTitle ?? "Dieta"}
          subtitle={data.nextMealTitle ? "da Manha" : "ativa"}
        />
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-full bg-[var(--card)] px-5 py-3 text-[var(--text-muted)] shadow-sm">
        <input
          type="search"
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <Search className="h-4 w-4" strokeWidth={1.7} />
      </div>
    </PageShell>
  );
}

function ModuleCard({
  href,
  icon,
  title,
  subtitle,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col rounded-[1.5rem] bg-[var(--card)] px-4 py-4 shadow-sm hover:shadow-md transition"
    >
      <span className="text-[var(--text-soft)]">{icon}</span>
      <span className="mt-8 truncate text-sm font-bold">{title}</span>
      <span className="truncate text-sm text-[var(--text-soft)]">{subtitle}</span>
    </Link>
  );
}
