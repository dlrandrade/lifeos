import Link from "next/link";
import { cookies } from "next/headers";
import {
  Bell,
  BookOpen,
  CalendarDays,
  ChevronRight,
  Droplets,
  Dumbbell,
  Film,
  HeartPulse,
  type LucideIcon,
  Pill,
  Search,
  TestTubeDiagonal,
  Utensils,
} from "lucide-react";
import { CreateBoardCard } from "@/components/create-board-card";
import { buildGreeting } from "@/lib/greeting";

type DashboardData = {
  userName: string;
  pendingTasks: number;
  doneTasks: number;
  hasWorkoutToday: boolean;
  waterPct: number;
  upcomingAppointment: string | null;
  pendingReminders: number;
  homeItems: Array<{ id: string; title: string; href: string }>;
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
};

export async function DashboardPage({ data }: { data: DashboardData }) {
  const now = new Date();
  const cookieStore = await cookies();
  const lastHook = cookieStore.get("lifeos_last_hook")?.value ?? null;

  const greeting = buildGreeting(
    {
      firstName: data.userName,
      hour: now.getHours(),
      weekDay: now.getDay(),
      pendingTasks: data.pendingTasks,
      doneTasks: data.doneTasks,
      hasWorkoutToday: data.hasWorkoutToday,
      waterPct: data.waterPct,
      upcomingAppointment: data.upcomingAppointment,
      pendingReminders: data.pendingReminders,
    },
    lastHook,
  );

  const cats = data.categories;

  return (
    <>
      <PersistHook hook={greeting.hook} />
      <div className="fixed inset-0 bg-[var(--bg)] p-3 sm:p-5 flex overflow-hidden">
        <div className="mx-auto flex w-full max-w-[768px] flex-col rounded-[2rem] bg-[var(--shell)] px-5 py-6 sm:px-7 sm:py-8 shadow-sm overflow-hidden">
          <div className="flex items-center justify-start">
            <span className="text-2xl font-bold tracking-tight">lifeOS</span>
          </div>

          <h1 className="mt-6 text-3xl leading-[1.15] tracking-tight sm:text-4xl">
            <span className="text-[var(--text-soft)]">{greeting.salutation}</span>
            <br />
            <span className="font-bold">{greeting.hook}</span>
          </h1>

          <div className="mt-6 flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
            {data.homeItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="h-7 w-7 shrink-0 rounded-md bg-[var(--check)]" />
                  <span className="truncate text-base sm:text-lg text-[var(--text-soft)] group-hover:text-[var(--text)]">
                    {item.title}
                  </span>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-[var(--text-muted)]"
                  strokeWidth={1.7}
                />
              </Link>
            ))}
          </div>

          <CategoryCarousel cats={cats} boards={data.boards} />

          <div className="mt-4 flex items-center gap-3 rounded-full bg-[var(--card)] px-5 py-3 text-[var(--text-muted)] shadow-sm">
            <input
              type="search"
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
            <Search className="h-4 w-4" strokeWidth={1.7} />
          </div>
        </div>
      </div>
    </>
  );
}

function PersistHook({ hook }: { hook: string }) {
  // Stores last shown hook so the next render can avoid repeating it.
  const encoded = encodeURIComponent(hook);
  const script = `document.cookie='lifeos_last_hook=${encoded};path=/;max-age=86400;samesite=lax'`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
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
    <div className="mt-6 -mx-5 sm:-mx-7 shrink-0">
      <div className="flex gap-3 overflow-x-auto px-5 sm:px-7 pb-1 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
