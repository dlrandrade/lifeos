import "server-only";
import { startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Appointment,
  Book,
  Exam,
  MealPlan,
  Medication,
  MedicationSchedule,
  Movie,
  Reminder,
  Profile,
  Task,
  TaskLog,
  WaterGoal,
  WaterLog,
  WorkoutDay,
  WorkoutExercise,
  WorkoutPlan,
} from "@/lib/supabase/types";

type SB = SupabaseClient;

function inferName(email: string, fullName?: string | null) {
  if (fullName?.trim()) return fullName.trim();
  return email.split("@")[0] || "Usuario";
}

async function ensureProfileBootstrap(
  userId: string,
  email: string,
  fullName: string | null,
) {
  // Trigger no SQL ja faz isso no signup. Esta funcao cobre usuarios antigos
  // ou casos em que o trigger ainda nao rodou.
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) return;

  const name = inferName(email, fullName);
  await admin.from("profiles").upsert(
    {
      user_id: userId,
      full_name: name,
      timezone: "America/Recife",
      daily_water_goal_ml: 2500,
    },
    { onConflict: "user_id" },
  );
  await admin.from("water_goals").upsert(
    { user_id: userId, daily_goal_ml: 2500 },
    { onConflict: "user_id" },
  );
}

export type UserContext = {
  userId: string;
  email: string;
  profile: Profile | null;
  waterGoal: WaterGoal | null;
  supabase: SB;
};

export async function getCurrentUserContext(): Promise<UserContext> {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser?.email) {
    redirect("/login");
  }

  const userId = authUser.id;
  const fullName =
    typeof authUser.user_metadata?.full_name === "string"
      ? authUser.user_metadata.full_name
      : null;

  const [{ data: profile }, { data: waterGoal }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<Profile>(),
    supabase
      .from("water_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<WaterGoal>(),
  ]);

  if (!profile || !waterGoal) {
    await ensureProfileBootstrap(userId, authUser.email, fullName);
    const { data: refreshedProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<Profile>();
    const { data: refreshedGoal } = await supabase
      .from("water_goals")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle<WaterGoal>();
    return {
      userId,
      email: authUser.email,
      profile: refreshedProfile ?? null,
      waterGoal: refreshedGoal ?? null,
      supabase,
    };
  }

  return {
    userId,
    email: authUser.email,
    profile,
    waterGoal,
    supabase,
  };
}

function todayIsoDate() {
  const d = startOfDay(new Date());
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

function todayStartIso() {
  return startOfDay(new Date()).toISOString();
}

export async function getDashboardData() {
  const { userId, profile, waterGoal, supabase } = await getCurrentUserContext();
  const today = startOfDay(new Date());
  const todayDate = todayIsoDate();
  const todayStart = todayStartIso();

  type WorkoutPlanWithDays = WorkoutPlan & {
    days: Array<
      WorkoutDay & {
        exercises: WorkoutExercise[];
      }
    >;
  };

  type MealPlanWithSections = MealPlan & {
    sections: Array<{
      id: string;
      meal_plan_id: string;
      title: string;
      sort_order: number;
      items: Array<{
        id: string;
        meal_section_id: string;
        description: string;
        sort_order: number;
      }>;
    }>;
  };

  const [
    tasksRes,
    taskLogsRes,
    waterLogsRes,
    workoutPlanRes,
    mealPlanRes,
    currentBookRes,
    appointmentsRes,
  ] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(6)
      .returns<Task[]>(),
    supabase
      .from("task_logs")
      .select("*")
      .eq("user_id", userId)
      .eq("occurred_on", todayDate)
      .returns<TaskLog[]>(),
    supabase
      .from("water_logs")
      .select("*")
      .eq("user_id", userId)
      .gte("occurred_at", todayStart)
      .returns<WaterLog[]>(),
    supabase
      .from("workout_plans")
      .select(
        `*, days:workout_days(*, exercises:workout_exercises(*))`,
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("week_day", { referencedTable: "workout_days", ascending: true })
      .order("sort_order", {
        referencedTable: "workout_days.workout_exercises",
        ascending: true,
      })
      .limit(1)
      .maybeSingle<WorkoutPlanWithDays>(),
    supabase
      .from("meal_plans")
      .select(
        `*, sections:meal_sections(*, items:meal_items(*))`,
      )
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("sort_order", { referencedTable: "meal_sections", ascending: true })
      .order("sort_order", {
        referencedTable: "meal_sections.meal_items",
        ascending: true,
      })
      .limit(1)
      .maybeSingle<MealPlanWithSections>(),
    supabase
      .from("books")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "READING")
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle<Book>(),
    supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .gte("starts_at", todayStart)
      .order("starts_at", { ascending: true })
      .limit(3)
      .returns<Appointment[]>(),
  ]);

  const tasks = tasksRes.data ?? [];
  const taskLogs = taskLogsRes.data ?? [];
  const waterLogs = waterLogsRes.data ?? [];
  const workoutPlan = workoutPlanRes.data ?? null;
  const mealPlan = mealPlanRes.data ?? null;
  const currentBook = currentBookRes.data ?? null;
  const appointments = appointmentsRes.data ?? [];

  const completedTaskIds = new Set(
    taskLogs.filter((item) => item.completed).map((item) => item.task_id),
  );
  const waterConsumed = waterLogs.reduce(
    (sum, entry) => sum + entry.amount_ml,
    0,
  );

  const todayWeekDay = new Date().getDay();
  const todayPlanDay = workoutPlan?.days?.find(
    (day) => day.week_day === todayWeekDay,
  );
  const goalMl = waterGoal?.daily_goal_ml ?? profile?.daily_water_goal_ml ?? 2500;

  return {
    userName: profile?.full_name ?? "Daniel",
    dateLabel: today,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: completedTaskIds.has(task.id),
    })),
    highlights: [
      {
        title: "Treino de hoje",
        value: todayPlanDay?.exercises?.length
          ? `${todayPlanDay.exercises.length} exercicios`
          : "Sem treino hoje",
        meta: workoutPlan?.name ?? "Nenhum plano ativo",
      },
      {
        title: "Dieta ativa",
        value: `${mealPlan?.sections?.length ?? 0} refeicoes`,
        meta: mealPlan?.name ?? "Sem plano ativo",
      },
      {
        title: "Hidratacao",
        value: `${waterConsumed}ml / ${goalMl}ml`,
        meta: "Consumo de hoje",
      },
      {
        title: "Compromissos",
        value: `${appointments.length} hoje`,
        meta: appointments[0]?.title ?? "Agenda livre",
      },
    ],
    currentBook: currentBook
      ? { title: currentBook.title, author: currentBook.author }
      : null,
    appointments: appointments.map((item) => ({
      id: item.id,
      title: item.title,
      startsAt: new Date(item.starts_at),
    })),
    waterConsumed,
    waterGoal: goalMl,
  };
}

type ModuleRecord = {
  id: string;
  title: string;
  subtitle: string;
  status?: string;
};

type ModuleSection = {
  id: string;
  title: string;
  subtitle: string;
  items: Array<{ id: string; title: string; subtitle: string }>;
};

type ModuleData = {
  countLabel: string;
  records: ModuleRecord[];
  sections: ModuleSection[];
  planId: string | null;
};

export async function getModuleData(slug: string): Promise<ModuleData> {
  const { userId, supabase } = await getCurrentUserContext();

  switch (slug) {
    case "treinos": {
      const { data: plan } = await supabase
        .from("workout_plans")
        .select(`*, days:workout_days(*, exercises:workout_exercises(*))`)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("week_day", { referencedTable: "workout_days", ascending: true })
        .order("sort_order", {
          referencedTable: "workout_days.workout_exercises",
          ascending: true,
        })
        .limit(1)
        .maybeSingle<
          WorkoutPlan & {
            days: Array<WorkoutDay & { exercises: WorkoutExercise[] }>;
          }
        >();

      const days = plan?.days ?? [];

      return {
        planId: plan?.id ?? null,
        sections: days.map((day) => ({
          id: day.id,
          title: day.title || `Dia ${day.week_day}`,
          subtitle: `Dia ${day.week_day}`,
          items: (day.exercises ?? []).map((exercise) => ({
            id: exercise.id,
            title: exercise.name,
            subtitle: exercise.notes ?? "",
          })),
        })),
        countLabel: `${days.length} dias configurados`,
        records: days.map((day) => ({
          id: day.id,
          title: day.title || `Dia ${day.week_day}`,
          subtitle: `${day.exercises?.length ?? 0} exercicios`,
        })),
      };
    }

    case "dieta": {
      const { data: plan } = await supabase
        .from("meal_plans")
        .select(`*, sections:meal_sections(*, items:meal_items(*))`)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("sort_order", {
          referencedTable: "meal_sections",
          ascending: true,
        })
        .order("sort_order", {
          referencedTable: "meal_sections.meal_items",
          ascending: true,
        })
        .limit(1)
        .maybeSingle<
          MealPlan & {
            sections: Array<{
              id: string;
              title: string;
              items: Array<{ id: string; description: string }>;
            }>;
          }
        >();

      const sections = plan?.sections ?? [];

      return {
        planId: plan?.id ?? null,
        sections: sections.map((section) => ({
          id: section.id,
          title: section.title,
          subtitle: `${section.items?.length ?? 0} itens`,
          items: (section.items ?? []).map((item) => ({
            id: item.id,
            title: item.description,
            subtitle: "",
          })),
        })),
        countLabel: `${sections.length} refeicoes`,
        records: sections.map((section) => ({
          id: section.id,
          title: section.title,
          subtitle: `${section.items?.length ?? 0} itens`,
        })),
      };
    }

    case "livros": {
      const { data: books = [] } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", userId)
        .order("status", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(12)
        .returns<Book[]>();

      const list = books ?? [];
      return {
        planId: null,
        sections: [],
        countLabel: `${list.length} livros`,
        records: list.map((book) => ({
          id: book.id,
          title: book.title,
          subtitle: `${book.author ?? "Autor indefinido"} • ${book.status}`,
          status: book.status,
        })),
      };
    }

    case "filmes": {
      const { data: movies = [] } = await supabase
        .from("movies")
        .select("*")
        .eq("user_id", userId)
        .order("status", { ascending: true })
        .order("updated_at", { ascending: false })
        .limit(12)
        .returns<Movie[]>();

      const list = movies ?? [];
      return {
        planId: null,
        sections: [],
        countLabel: `${list.length} filmes`,
        records: list.map((movie) => ({
          id: movie.id,
          title: movie.title,
          subtitle: `${movie.genre ?? "Genero livre"} • ${movie.status}`,
          status: movie.status,
        })),
      };
    }

    case "hidratacao": {
      const { data: logs = [] } = await supabase
        .from("water_logs")
        .select("*")
        .eq("user_id", userId)
        .gte("occurred_at", todayStartIso())
        .order("occurred_at", { ascending: false })
        .returns<WaterLog[]>();

      const list = logs ?? [];
      const total = list.reduce((sum, item) => sum + item.amount_ml, 0);
      return {
        planId: null,
        sections: [],
        countLabel: `${total}ml hoje`,
        records: list.map((log) => ({
          id: log.id,
          title: `${log.amount_ml}ml`,
          subtitle: new Date(log.occurred_at).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      };
    }

    case "compromissos": {
      const { data: items = [] } = await supabase
        .from("appointments")
        .select("*")
        .eq("user_id", userId)
        .order("starts_at", { ascending: true })
        .limit(12)
        .returns<Appointment[]>();

      const list = items ?? [];
      return {
        planId: null,
        sections: [],
        countLabel: `${list.length} registros`,
        records: list.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: `${new Date(item.starts_at).toLocaleDateString("pt-BR")} • ${item.status}`,
          status: item.status,
        })),
      };
    }

    case "lembretes": {
      const { data: items = [] } = await supabase
        .from("reminders")
        .select("*")
        .eq("user_id", userId)
        .order("status", { ascending: true })
        .order("due_at", { ascending: true, nullsFirst: false })
        .limit(12)
        .returns<Reminder[]>();

      const list = items ?? [];
      return {
        planId: null,
        sections: [],
        countLabel: `${list.length} lembretes`,
        records: list.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: `${item.priority} • ${item.status}`,
          status: item.status,
        })),
      };
    }

    case "remedios": {
      const { data: items = [] } = await supabase
        .from("medications")
        .select(`*, schedules:medication_schedules(*)`)
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(12)
        .returns<
          Array<Medication & { schedules: MedicationSchedule[] }>
        >();

      const list = items ?? [];
      return {
        planId: null,
        sections: [],
        countLabel: `${list.length} remedios ativos`,
        records: list.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: `${item.schedules?.length ?? 0} horarios • ${item.frequency_type}`,
        })),
      };
    }

    case "exames": {
      const { data: items = [] } = await supabase
        .from("exams")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(12)
        .returns<Exam[]>();

      const list = items ?? [];
      return {
        planId: null,
        sections: [],
        countLabel: `${list.length} exames`,
        records: list.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: `${item.current_status} • ${item.category ?? "Geral"}`,
        })),
      };
    }

    default:
      return { planId: null, sections: [], countLabel: "0 itens", records: [] };
  }
}
