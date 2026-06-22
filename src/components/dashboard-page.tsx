import Link from "next/link";
import { cookies } from "next/headers";
import {
  Bell,
  ChevronRight,
  Droplets,
  Dumbbell,
  type LucideIcon,
} from "lucide-react";
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
    water: { consumed: number; goal: number };
    pendingReminders: number;
  };
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
      <div className="safe-area fixed inset-0 bg-[var(--bg)] sm:p-5 flex overflow-hidden">
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

          <CategoryCarousel cats={cats} />
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

function CategoryCarousel({ cats }: { cats: DashboardData["categories"] }) {
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
          href="/hidratacao"
          Icon={Droplets}
          title={`${cats.water.consumed}ml`}
          subtitle={`/ ${cats.water.goal}ml`}
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
