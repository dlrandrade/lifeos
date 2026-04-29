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

  const waterPct = Math.round((waterConsumed / goalMl) * 100);

  type HomeItem = {
    id: string;
    title: string;
    href: string;
    priority: number;
    recentAt: number;
  };
  const homeItems: HomeItem[] = [];
  if (waterPct < 100) {
    homeItems.push({
      id: "water",
      title: "Beber agua",
      href: "/hidratacao",
      priority: waterPct < 50 ? 10 : 40,
      recentAt: Date.now(),
    });
  }
  if (todayPlanDay?.exercises?.length) {
    homeItems.push({
      id: `workout-${todayPlanDay.id}`,
      title: todayPlanDay.title || "Treino de hoje",
      href: "/treinos",
      priority: 15,
      recentAt: new Date(workoutPlan?.updated_at ?? Date.now()).getTime(),
    });
  }
  if (currentBook) {
    homeItems.push({
      id: `book-${currentBook.id}`,
      title: `Ler ${currentBook.title}`,
      href: "/livros",
      priority: 35,
      recentAt: new Date(currentBook.updated_at ?? Date.now()).getTime(),
    });
  }
  if (mealPlan?.sections?.[0]) {
    homeItems.push({
      id: `meal-${mealPlan.sections[0].id}`,
      title: mealPlan.sections[0].title,
      href: "/dieta",
      priority: 30,
      recentAt: Date.now(),
    });
  }
  for (const med of activeMeds) {
    homeItems.push({
      id: `med-${med.id}`,
      title: `Tomar ${med.name}`,
      href: "/remedios",
      priority: 20,
      recentAt: Date.now(),
    });
  }
  if (upcoming) {
    homeItems.push({
      id: `appt-${upcoming.id}`,
      title: upcoming.title,
      href: "/compromissos",
      priority: 5,
      recentAt: new Date(upcoming.starts_at).getTime(),
    });
  }
  for (const reminder of (pendingRemindersRes.data ?? []).slice(0, 3)) {
    homeItems.push({
      id: `reminder-${reminder.id}`,
      title: "Lembrete pendente",
      href: "/lembretes",
      priority: 25,
      recentAt: Date.now(),
    });
  }
  for (const exam of pendingExams) {
    homeItems.push({
      id: `exam-${exam.id}`,
      title: exam.name,
      href: "/exames",
      priority: 45,
      recentAt: Date.now(),
    });
  }
  if (queuedMovies[0]) {
    homeItems.push({
      id: `movie-${queuedMovies[0].id}`,
      title: `Assistir ${queuedMovies[0].title}`,
      href: "/filmes",
      priority: 50,
      recentAt: Date.now(),
    });
  }

  homeItems.sort((a, b) => a.priority - b.priority || b.recentAt - a.recentAt);

  return {
    userName: firstName,
    pendingTasks,
    doneTasks,
    hasWorkoutToday: !!todayPlanDay?.exercises?.length,
    waterPct,
    upcomingAppointment,
    pendingReminders,
    homeItems: homeItems.slice(0, 6).map(({ id, title, href }) => ({ id, title, href })),
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

export type TreinosExercise = {
  id: string;
  name: string;
  sets: number | null;
  reps: string | null;
  load: string | null;
  completed: boolean;
};

export type TreinosGroup = {
  id: string;
  weekDay: number;
  weekDayLabel: string;
  title: string;
  isToday: boolean;
  exercises: TreinosExercise[];
  totalCount: number;
  doneCount: number;
  allDone: boolean;
};

export type TreinosData = {
  plan: (WorkoutPlan & { days: Array<WorkoutDay & { exercises: WorkoutExercise[] }> }) | null;
  todayWeekDay: number;
  todayLabel: string;
  groups: TreinosGroup[];
  todayGroups: TreinosGroup[];
  stats: {
    todayDone: number;
    todayTotal: number;
    weekDaysCompleted: number;
    weekDaysPlanned: number;
    monthTrainedDays: number;
    streak: number;
    last7: Array<{ date: string; weekDay: number; count: number; trained: boolean }>;
  };
};

export async function getTreinosData(): Promise<TreinosData> {
  const { userId, supabase } = await getCurrentUserContext();
  const todayDate = todayIsoDate();
  const todayWeekDay = new Date().getDay();

  // Busca plano ativo
  const { data: plan, error: planErr } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<WorkoutPlan>();

  if (planErr) console.error("getTreinosData plan:", planErr.message);

  if (!plan) {
    return {
      plan: null,
      todayWeekDay,
      todayLabel: WEEK_DAY_NAMES[todayWeekDay],
      groups: [],
      todayGroups: [],
      stats: {
        todayDone: 0,
        todayTotal: 0,
        weekDaysCompleted: 0,
        weekDaysPlanned: 0,
        monthTrainedDays: 0,
        streak: 0,
        last7: [],
      },
    };
  }

  // Busca dias do plano
  const { data: daysRaw } = await supabase
    .from("workout_days")
    .select("*")
    .eq("workout_plan_id", plan.id)
    .order("week_day", { ascending: true })
    .order("created_at", { ascending: true })
    .returns<WorkoutDay[]>();

  const days = daysRaw ?? [];
  const dayIds = days.map((d) => d.id);

  // Busca exercicios de todos os dias
  let exercisesRaw: WorkoutExercise[] = [];
  if (dayIds.length) {
    const { data } = await supabase
      .from("workout_exercises")
      .select("*")
      .in("workout_day_id", dayIds)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .returns<WorkoutExercise[]>();
    exercisesRaw = data ?? [];
  }

  const exercisesByDay = new Map<string, WorkoutExercise[]>();
  for (const ex of exercisesRaw) {
    if (!exercisesByDay.has(ex.workout_day_id)) {
      exercisesByDay.set(ex.workout_day_id, []);
    }
    exercisesByDay.get(ex.workout_day_id)!.push(ex);
  }

  const allExerciseIds = exercisesRaw.map((e) => e.id);

  // Logs de hoje
  const todayLogs = new Set<string>();
  if (allExerciseIds.length) {
    const { data: logs } = await supabase
      .from("workout_logs")
      .select("workout_exercise_id, completed")
      .in("workout_exercise_id", allExerciseIds)
      .eq("occurred_on", todayDate);
    for (const log of logs ?? []) {
      if ((log as { completed: boolean }).completed) {
        todayLogs.add((log as { workout_exercise_id: string }).workout_exercise_id);
      }
    }
  }

  // Logs da semana corrente (Dom-Sab)
  const weekLogsCompletedByDay = new Map<number, number>();
  if (allExerciseIds.length) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    const { data: weekLogs } = await supabase
      .from("workout_logs")
      .select("workout_exercise_id, occurred_on, completed")
      .in("workout_exercise_id", allExerciseIds)
      .gte("occurred_on", start.toISOString().slice(0, 10))
      .lt("occurred_on", end.toISOString().slice(0, 10));

    type WkLog = { workout_exercise_id: string; occurred_on: string; completed: boolean };
    const exerciseToDay = new Map<string, number>();
    for (const d of days) {
      for (const ex of exercisesByDay.get(d.id) ?? []) {
        exerciseToDay.set(ex.id, d.week_day);
      }
    }
    const dayDone = new Map<number, Map<string, Set<string>>>();
    for (const log of (weekLogs ?? []) as WkLog[]) {
      if (!log.completed) continue;
      const wd = exerciseToDay.get(log.workout_exercise_id);
      if (wd === undefined) continue;
      if (!dayDone.has(wd)) dayDone.set(wd, new Map());
      const byDate = dayDone.get(wd)!;
      if (!byDate.has(log.occurred_on)) byDate.set(log.occurred_on, new Set());
      byDate.get(log.occurred_on)!.add(log.workout_exercise_id);
    }
    for (const [wd, byDate] of dayDone.entries()) {
      const dayExs = days
        .filter((d) => d.week_day === wd)
        .flatMap((d) => exercisesByDay.get(d.id) ?? []);
      const total = dayExs.length;
      let completed = 0;
      for (const set of byDate.values()) if (total > 0 && set.size >= total) completed++;
      weekLogsCompletedByDay.set(wd, completed);
    }
  }

  // Monta grupos
  const planWithDays = {
    ...plan,
    days: days.map((d) => ({
      ...d,
      exercises: exercisesByDay.get(d.id) ?? [],
    })),
  };

  const groups: TreinosGroup[] = days.map((d) => {
    const exs = exercisesByDay.get(d.id) ?? [];
    const exercises: TreinosExercise[] = exs.map((e) => ({
      id: e.id,
      name: e.name,
      sets: e.sets ?? null,
      reps: e.reps ?? null,
      load: e.load ?? null,
      completed: todayLogs.has(e.id),
    }));
    const totalCount = exercises.length;
    const doneCount = exercises.filter((e) => e.completed).length;
    return {
      id: d.id,
      weekDay: d.week_day,
      weekDayLabel: WEEK_DAY_NAMES[d.week_day],
      title: d.title || WEEK_DAY_NAMES[d.week_day],
      isToday: d.week_day === todayWeekDay,
      exercises,
      totalCount,
      doneCount,
      allDone: totalCount > 0 && doneCount === totalCount,
    };
  });

  const todayGroups = groups.filter((g) => g.isToday);
  const todayDone = todayGroups.reduce((sum, g) => sum + g.doneCount, 0);
  const todayTotal = todayGroups.reduce((sum, g) => sum + g.totalCount, 0);

  const weekDaysPlanned = new Set(
    groups.filter((g) => g.totalCount > 0).map((g) => g.weekDay),
  ).size;
  let weekDaysCompleted = 0;
  for (const wd of new Set(groups.map((g) => g.weekDay))) {
    if ((weekLogsCompletedByDay.get(wd) ?? 0) > 0) weekDaysCompleted++;
  }

  // Historico: ultimos 7 dias e mes corrente
  const last7: Array<{ date: string; weekDay: number; count: number; trained: boolean }> = [];
  let monthTrainedDays = 0;
  let streak = 0;
  if (allExerciseIds.length) {
    const monthStart = new Date();
    monthStart.setHours(0, 0, 0, 0);
    monthStart.setDate(1);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    const horizonStart = new Date(monthStart);
    const sevenAgo = new Date();
    sevenAgo.setHours(0, 0, 0, 0);
    sevenAgo.setDate(sevenAgo.getDate() - 6);
    if (sevenAgo < horizonStart) horizonStart.setTime(sevenAgo.getTime());

    const { data: histLogs } = await supabase
      .from("workout_logs")
      .select("occurred_on, completed")
      .in("workout_exercise_id", allExerciseIds)
      .gte("occurred_on", horizonStart.toISOString().slice(0, 10))
      .lt("occurred_on", monthEnd.toISOString().slice(0, 10));

    const dateCounts = new Map<string, number>();
    for (const log of (histLogs ?? []) as Array<{ occurred_on: string; completed: boolean }>) {
      if (!log.completed) continue;
      dateCounts.set(log.occurred_on, (dateCounts.get(log.occurred_on) ?? 0) + 1);
    }
    for (const [date] of dateCounts) {
      if (date >= monthStart.toISOString().slice(0, 10)) monthTrainedDays++;
    }
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const count = dateCounts.get(iso) ?? 0;
      last7.push({ date: iso, weekDay: d.getDay(), count, trained: count > 0 });
    }
    // streak: consecutivos a partir de hoje (ou ontem se hoje 0)
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    if ((dateCounts.get(cursor.toISOString().slice(0, 10)) ?? 0) === 0) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while ((dateCounts.get(cursor.toISOString().slice(0, 10)) ?? 0) > 0) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }

  return {
    plan: planWithDays,
    todayWeekDay,
    todayLabel: WEEK_DAY_NAMES[todayWeekDay],
    groups,
    todayGroups,
    stats: {
      todayDone,
      todayTotal,
      weekDaysCompleted,
      weekDaysPlanned,
      monthTrainedDays,
      streak,
      last7,
    },
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

