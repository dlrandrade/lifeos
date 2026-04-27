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

// Helper para queries que dependem de tabelas opcionais (ex: boards do 0002).
// Se a tabela nao existir, retorna { data: [], error: null } e segue.
async function safeSelect<T>(
  supabase: SB,
  query: (s: SB) => Promise<{ data: T | null; error: { message: string } | null }>,
): Promise<{ data: T | null; error: null }> {
  try {
    const { data, error } = await query(supabase);
    if (error) {
      // Tabela nao existe ou outro erro de RLS: trata como "sem dados".
      return { data: null, error: null };
    }
    return { data, error: null };
  } catch {
    return { data: null, error: null };
  }
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
    pendingRemindersRes,
    activeMedsRes,
    pendingExamsRes,
    queuedMoviesRes,
    boardsRes,
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
    supabase
      .from("reminders")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "PENDING"),
    supabase
      .from("medications")
      .select("id, name")
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(5),
    supabase
      .from("exams")
      .select("id, name")
      .eq("user_id", userId)
      .in("current_status", ["PLANNED", "SCHEDULED"])
      .limit(5),
    supabase
      .from("movies")
      .select("id, title")
      .eq("user_id", userId)
      .eq("status", "TO_WATCH")
      .order("updated_at", { ascending: false })
      .limit(1),
    safeSelect(supabase, async (s) =>
      s
        .from("boards")
        .select("id, name, model, icon")
        .eq("user_id", userId)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ),
  ]);

  const tasks = tasksRes.data ?? [];
  const taskLogs = taskLogsRes.data ?? [];
  const waterLogs = waterLogsRes.data ?? [];
  const workoutPlan = workoutPlanRes.data ?? null;
  const mealPlan = mealPlanRes.data ?? null;
  const currentBook = currentBookRes.data ?? null;
  const appointments = appointmentsRes.data ?? [];
  const pendingReminders = pendingRemindersRes.data?.length ?? 0;
  const activeMeds = activeMedsRes.data ?? [];
  const pendingExams = pendingExamsRes.data ?? [];
  const queuedMovies = queuedMoviesRes.data ?? [];
  const boards = (boardsRes.data ?? []) as Array<{
    id: string;
    name: string;
    model: string;
    icon: string | null;
  }>;

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
  void today;

  const firstName = (profile?.full_name ?? "Daniel").split(" ")[0];
  const pendingTasks = tasks.filter((t) => !completedTaskIds.has(t.id)).length;
  const doneTasks = tasks.length - pendingTasks;

  const upcoming = appointments[0];
  const upcomingAppointment = upcoming
    ? `${new Date(upcoming.starts_at).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })} ${upcoming.title}`
    : null;

  return {
    userName: firstName,
    pendingTasks,
    doneTasks,
    hasWorkoutToday: !!todayPlanDay?.exercises?.length,
    waterPct: Math.round((waterConsumed / goalMl) * 100),
    upcomingAppointment,
    pendingReminders,
    categories: {
      todayWorkout: todayPlanDay?.title ?? null,
      currentBook: currentBook
        ? { title: currentBook.title, author: currentBook.author }
        : null,
      nextMeal: mealPlan?.sections?.[0]?.title ?? null,
      water: { consumed: waterConsumed, goal: goalMl },
      nextAppointment: upcoming
        ? {
            title: upcoming.title,
            time: new Date(upcoming.starts_at).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }
        : null,
      pendingReminders,
      activeMedicationsCount: activeMeds.length,
      pendingExamsCount: pendingExams.length,
      nextMovie: queuedMovies[0] ?? null,
    },
    boards,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: completedTaskIds.has(task.id),
    })),
  };
}

// ============================================================
// Loaders especializados por modulo
// ============================================================

const WEEK_DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

const MONTH_NAMES = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export async function getTreinosData() {
  const { userId, supabase } = await getCurrentUserContext();
  const todayDate = todayIsoDate();

  type PlanShape = WorkoutPlan & {
    days: Array<WorkoutDay & { exercises: WorkoutExercise[] }>;
  };

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
    .maybeSingle<PlanShape>();

  if (!plan) {
    return { plan: null as PlanShape | null, days: [], today: { id: null as string | null, weekDay: new Date().getDay(), title: WEEK_DAY_NAMES[new Date().getDay()], exercises: [] as Array<{ id: string; name: string; completed: boolean }> }, otherDays: [] as Array<{ id: string; weekDay: number; title: string }> };
  }

  const todayWeekDay = new Date().getDay();
  const days = plan.days ?? [];

  const allExerciseIds = days.flatMap((d) => d.exercises?.map((e) => e.id) ?? []);
  let completedSet = new Set<string>();
  if (allExerciseIds.length) {
    const { data: logs } = await supabase
      .from("workout_logs")
      .select("workout_exercise_id, completed")
      .in("workout_exercise_id", allExerciseIds)
      .eq("occurred_on", todayDate);
    completedSet = new Set(
      (logs ?? [])
        .filter((l: { completed: boolean }) => l.completed)
        .map((l: { workout_exercise_id: string }) => l.workout_exercise_id),
    );
  }

  const todayPlanDay = days.find((d) => d.week_day === todayWeekDay) ?? null;
  const otherDays = days
    .filter((d) => d.week_day !== todayWeekDay)
    .map((d) => ({
      id: d.id,
      weekDay: d.week_day,
      title: d.title || WEEK_DAY_NAMES[d.week_day],
    }));

  return {
    plan,
    days,
    today: {
      id: todayPlanDay?.id ?? null,
      weekDay: todayWeekDay,
      title: todayPlanDay?.title || WEEK_DAY_NAMES[todayWeekDay],
      exercises:
        todayPlanDay?.exercises?.map((e) => ({
          id: e.id,
          name: e.name,
          completed: completedSet.has(e.id),
        })) ?? [],
    },
    otherDays,
  };
}

export async function getDietaData() {
  const { userId, supabase } = await getCurrentUserContext();
  const todayDate = todayIsoDate();

  type PlanShape = MealPlan & {
    sections: Array<{
      id: string;
      title: string;
      sort_order: number;
      items: Array<{ id: string; description: string; sort_order: number }>;
    }>;
  };

  const { data: plan } = await supabase
    .from("meal_plans")
    .select(`*, sections:meal_sections(*, items:meal_items(*))`)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "meal_sections", ascending: true })
    .order("sort_order", {
      referencedTable: "meal_sections.meal_items",
      ascending: true,
    })
    .limit(1)
    .maybeSingle<PlanShape>();

  if (!plan) {
    return {
      plan: null as PlanShape | null,
      monthLabel: MONTH_NAMES[new Date().getMonth()],
      sections: [] as Array<{
        id: string;
        title: string;
        completedToday: boolean;
        items: Array<{ id: string; description: string }>;
      }>,
    };
  }

  const sectionIds = (plan.sections ?? []).map((s) => s.id);
  let completedSet = new Set<string>();
  if (sectionIds.length) {
    const { data: logs } = await supabase
      .from("meal_logs")
      .select("meal_section_id, completed")
      .in("meal_section_id", sectionIds)
      .eq("occurred_on", todayDate);
    completedSet = new Set(
      (logs ?? [])
        .filter((l: { completed: boolean }) => l.completed)
        .map((l: { meal_section_id: string }) => l.meal_section_id),
    );
  }

  return {
    plan,
    monthLabel: plan.name || MONTH_NAMES[new Date().getMonth()],
    sections: (plan.sections ?? []).map((s) => ({
      id: s.id,
      title: s.title,
      completedToday: completedSet.has(s.id),
      items: (s.items ?? []).map((i) => ({ id: i.id, description: i.description })),
    })),
  };
}

export async function getLivrosData() {
  const { userId, supabase } = await getCurrentUserContext();
  const year = new Date().getFullYear();

  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("user_id", userId)
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(50)
    .returns<Book[]>();

  const all = books ?? [];
  const reading = all.filter((b) => b.status === "READING");
  const queue = all.filter((b) => b.status === "TO_READ");
  const finished = all.filter((b) => b.status === "FINISHED");

  return { year, reading, queue, finished };
}

export async function getFilmesData() {
  const { userId, supabase } = await getCurrentUserContext();

  const { data: movies } = await supabase
    .from("movies")
    .select("*")
    .eq("user_id", userId)
    .order("status", { ascending: true })
    .order("updated_at", { ascending: false })
    .limit(50)
    .returns<Movie[]>();

  const all = movies ?? [];
  const watching = all.filter((m) => m.status === "WATCHING");
  const queue = all.filter((m) => m.status === "TO_WATCH");
  const watched = all.filter((m) => m.status === "WATCHED");
  return { watching, queue, watched };
}

export async function getHidratacaoData() {
  const { userId, profile, waterGoal, supabase } = await getCurrentUserContext();
  const todayStart = todayStartIso();

  const { data: logs } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("occurred_at", todayStart)
    .order("occurred_at", { ascending: false })
    .returns<WaterLog[]>();

  const list = logs ?? [];
  const total = list.reduce((sum, l) => sum + l.amount_ml, 0);
  const goal = waterGoal?.daily_goal_ml ?? profile?.daily_water_goal_ml ?? 2500;
  return {
    goal,
    total,
    logs: list.map((l) => ({
      id: l.id,
      amountMl: l.amount_ml,
      occurredAt: new Date(l.occurred_at),
    })),
  };
}

export async function getCompromissosData() {
  const { userId, supabase } = await getCurrentUserContext();

  const { data: items } = await supabase
    .from("appointments")
    .select("*")
    .eq("user_id", userId)
    .order("starts_at", { ascending: true })
    .limit(50)
    .returns<Appointment[]>();

  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    startsAt: new Date(item.starts_at),
    status: item.status,
  }));
}

export async function getLembretesData() {
  const { userId, supabase } = await getCurrentUserContext();

  const { data: items } = await supabase
    .from("reminders")
    .select("*")
    .eq("user_id", userId)
    .order("status", { ascending: true })
    .order("due_at", { ascending: true, nullsFirst: false })
    .limit(50)
    .returns<Reminder[]>();

  return (items ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    priority: item.priority,
    status: item.status,
    dueAt: item.due_at ? new Date(item.due_at) : null,
  }));
}

export async function getRemediosData() {
  const { userId, supabase } = await getCurrentUserContext();

  const { data: items } = await supabase
    .from("medications")
    .select(`*, schedules:medication_schedules(*)`)
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<Array<Medication & { schedules: MedicationSchedule[] }>>();

  return (items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    schedules: (item.schedules ?? []).length,
    frequency: item.frequency_type,
  }));
}

export async function getExamesData() {
  const { userId, supabase } = await getCurrentUserContext();

  const { data: items } = await supabase
    .from("exams")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(50)
    .returns<Exam[]>();

  return (items ?? []).map((item) => ({
    id: item.id,
    name: item.name,
    status: item.current_status,
    category: item.category,
  }));
}

