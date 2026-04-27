import Link from "next/link";
import {
  Bell,
  BookOpen,
  CalendarDays,
  Droplets,
  Dumbbell,
  Film,
  HeartPulse,
  type LucideIcon,
  Pencil,
  Pill,
  Plus,
  Search,
  TestTubeDiagonal,
  Trash2,
  Utensils,
} from "lucide-react";
import { CheckButton } from "@/components/check-button";
import { CreateBoardCard } from "@/components/create-board-card";
import {
  createTask,
  deleteTask,
  toggleTaskForToday,
  updateTask,
} from "@/server/actions";
import { buildGreeting } from "@/lib/greeting";

type DashboardData = {
  userName: string;
  pendingTasks: number;
  doneTasks: number;
  hasWorkoutToday: boolean;
  waterPct: number;
  upcomingAppointment: string | null;
  pendingReminders: number;
  categories: {
    todayWorkout: string | null;
    currentBook: { title: string; author: string | null } | null;
    nextMeal: string | null;
    water: { consumed: number; goal: number };
    nextAppointment: { title: string; time: string } | null;
    pendingReminders: number;
    activeMedicationsCount: number;
    pendingExamsCount: number;
    nextMovie: { id: string; title: string } | null;
  };
  boards: Array<{ id: string; name: string; model: string; icon: string | null }>;
  tasks: Array<{ id: string; title: string; completed: boolean }>;
};

export function DashboardPage({ data }: { data: DashboardData }) {
  const now = new Date();
  const greeting = buildGreeting({
    firstName: data.userName,
    hour: now.getHours(),
    weekDay: now.getDay(),
    pendingTasks: data.pendingTasks,
    doneTasks: data.doneTasks,
    hasWorkoutToday: data.hasWorkoutToday,
    waterPct: data.waterPct,
    upcomingAppointment: data.upcomingAppointment,
    pendingReminders: data.pendingReminders,
  });

  const cats = data.categories;

  return (
    <div className="rounded-[2rem] bg-[var(--shell)] px-5 py-6 sm:px-7 sm:py-8 shadow-sm">
      <div className="flex items-center justify-end">
        <span className="text-2xl font-bold tracking-tight">lifeOS</span>
      </div>

      <h1 className="mt-8 text-3xl leading-[1.15] tracking-tight sm:text-4xl">
        <span className="text-[var(--text-soft)]">{greeting.salutation}</span>
        <br />
        <span className="font-bold">{greeting.hook}</span>
      </h1>

      <div className="mt-8 space-y-3">
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
                className={`truncate text-base sm:text-lg ${
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

        <form action={createTask} className="flex items-center gap-3 pt-1">
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

      <CategoryCarousel
        cats={cats}
        boards={data.boards}
      />

      <div className="mt-6 flex items-center gap-3 rounded-full bg-[var(--card)] px-5 py-3 text-[var(--text-muted)] shadow-sm">
        <input
          type="search"
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <Search className="h-4 w-4" strokeWidth={1.7} />
      </div>
    </div>
  );
}

const BOARD_ICONS: Record<string, LucideIcon> = {
  HeartPulse,
  Dumbbell,
  Utensils,
  BookOpen,
  Film,
  Droplets,
  CalendarDays,
  Bell,
  Pill,
  TestTubeDiagonal,
};

function CategoryCarousel({
  cats,
  boards,
}: {
  cats: DashboardData["categories"];
  boards: DashboardData["boards"];
}) {
  return (
    <div className="mt-10 -mx-5 sm:-mx-7">
      <div className="flex gap-3 overflow-x-auto px-5 sm:px-7 pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <CatCard
          href="/treinos"
          Icon={Dumbbell}
          title="Treino"
          subtitle={cats.todayWorkout ?? "de hoje"}
        />
        <CatCard
          href="/livros"
          Icon={BookOpen}
          title={cats.currentBook?.title ?? "Livros"}
          subtitle={cats.currentBook?.author ?? "leitura atual"}
        />
        <CatCard
          href="/dieta"
          Icon={Utensils}
          title={cats.nextMeal ?? "Dieta"}
          subtitle={cats.nextMeal ? "da Manha" : "ativa"}
        />
        <CatCard
          href="/hidratacao"
          Icon={Droplets}
          title={`${cats.water.consumed}ml`}
          subtitle={`/ ${cats.water.goal}ml`}
        />
        <CatCard
          href="/compromissos"
          Icon={CalendarDays}
          title={cats.nextAppointment?.title ?? "Compromissos"}
          subtitle={cats.nextAppointment?.time ?? "agenda"}
        />
        <CatCard
          href="/lembretes"
          Icon={Bell}
          title="Lembretes"
          subtitle={
            cats.pendingReminders > 0
              ? `${cats.pendingReminders} pendentes`
              : "sem pendencias"
          }
        />
        <CatCard
          href="/remedios"
          Icon={Pill}
          title="Remedios"
          subtitle={
            cats.activeMedicationsCount > 0
              ? `${cats.activeMedicationsCount} ativos`
              : "nenhum"
          }
        />
        <CatCard
          href="/exames"
          Icon={TestTubeDiagonal}
          title="Exames"
          subtitle={
            cats.pendingExamsCount > 0
              ? `${cats.pendingExamsCount} pendentes`
              : "em dia"
          }
        />
        <CatCard
          href="/filmes"
          Icon={Film}
          title={cats.nextMovie?.title ?? "Filmes"}
          subtitle="fila"
        />

        {boards.map((board) => {
          const Icon: LucideIcon =
            (board.icon ? BOARD_ICONS[board.icon] : undefined) ?? HeartPulse;
          return (
            <CatCard
              key={board.id}
              href={`/lista/${board.id}`}
              Icon={Icon}
              title={board.name}
              subtitle={board.model.toLowerCase()}
            />
          );
        })}

        <CreateBoardCard />
      </div>
    </div>
  );
}

function CatCard({
  href,
  Icon,
  title,
  subtitle,
}: {
  href: string;
  Icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="snap-start shrink-0 w-[140px] flex flex-col rounded-[1.5rem] bg-[var(--card)] px-4 py-4 shadow-sm hover:shadow-md transition"
    >
      <Icon className="h-5 w-5 text-[var(--text-soft)]" strokeWidth={1.7} />
      <span className="mt-8 truncate text-sm font-bold">{title}</span>
      <span className="truncate text-sm text-[var(--text-soft)]">{subtitle}</span>
    </Link>
  );
}
