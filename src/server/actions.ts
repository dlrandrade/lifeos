"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserContext } from "@/server/app-data";
import { fetchBookCover } from "@/lib/openlibrary";

const nonEmptyText = z.string().trim().min(1);
const optionalText = z.string().trim().optional();

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function readId(formData: FormData, key: string) {
  return nonEmptyText.parse(readText(formData, key));
}

function todayDateIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

// ---------- Tasks ----------

export async function createTask(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("tasks").insert({
    user_id: userId,
    title,
    is_recurring: true,
  });
  if (error) throw new Error(`createTask: ${error.message}`);

  revalidatePath("/dashboard");
}

export async function updateTask(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("tasks")
    .update({ title })
    .eq("id", taskId);
  if (error) throw new Error(`updateTask: ${error.message}`);

  revalidatePath("/dashboard");
}

export async function toggleTaskForToday(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const { userId, supabase } = await getCurrentUserContext();
  const occurredOn = todayDateIso();

  const { data: existing, error: selErr } = await supabase
    .from("task_logs")
    .select("id")
    .eq("task_id", taskId)
    .eq("occurred_on", occurredOn)
    .maybeSingle();
  if (selErr) throw new Error(`toggleTaskForToday: ${selErr.message}`);

  if (existing) {
    const { error } = await supabase
      .from("task_logs")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(`toggleTaskForToday: ${error.message}`);
  } else {
    const { error } = await supabase.from("task_logs").insert({
      user_id: userId,
      task_id: taskId,
      occurred_on: occurredOn,
      completed: true,
    });
    if (error) throw new Error(`toggleTaskForToday: ${error.message}`);
  }

  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) throw new Error(`deleteTask: ${error.message}`);

  revalidatePath("/dashboard");
}

// ---------- Water ----------

export async function addWaterLog(formData: FormData) {
  const amountMl = z.coerce
    .number()
    .int()
    .positive()
    .parse(readText(formData, "amountMl"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("water_logs").insert({
    user_id: userId,
    amount_ml: amountMl,
    occurred_at: new Date().toISOString(),
  });
  if (error) throw new Error(`addWaterLog: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/hidratacao");
}

export async function deleteWaterLog(formData: FormData) {
  const logId = readId(formData, "logId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("water_logs").delete().eq("id", logId);
  if (error) throw new Error(`deleteWaterLog: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/hidratacao");
}

// ---------- Appointments ----------

export async function createAppointment(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const startsAt = z.coerce.date().parse(readText(formData, "startsAt"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("appointments").insert({
    user_id: userId,
    title,
    starts_at: startsAt.toISOString(),
  });
  if (error) throw new Error(`createAppointment: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function updateAppointmentStatus(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const status = z
    .enum(["SCHEDULED", "DONE", "CANCELED"])
    .parse(readText(formData, "status"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", appointmentId);
  if (error) throw new Error(`updateAppointmentStatus: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function deleteAppointment(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("appointments")
    .delete()
    .eq("id", appointmentId);
  if (error) throw new Error(`deleteAppointment: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

// ---------- Reminders ----------

export async function createReminder(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("reminders").insert({
    user_id: userId,
    title,
  });
  if (error) throw new Error(`createReminder: ${error.message}`);

  revalidatePath("/lembretes");
}

export async function updateReminderStatus(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const status = z
    .enum(["PENDING", "DONE", "CANCELED"])
    .parse(readText(formData, "status"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("reminders")
    .update({ status })
    .eq("id", reminderId);
  if (error) throw new Error(`updateReminderStatus: ${error.message}`);

  revalidatePath("/lembretes");
}

export async function deleteReminder(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", reminderId);
  if (error) throw new Error(`deleteReminder: ${error.message}`);

  revalidatePath("/lembretes");
}

// ---------- Books ----------

export async function createBook(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const author = optionalText.parse(readText(formData, "author"));
  const { userId, supabase } = await getCurrentUserContext();

  const cover = await fetchBookCover(title, author).catch(() => null);

  const { error } = await supabase.from("books").insert({
    user_id: userId,
    title,
    author: author || null,
    cover_url: cover,
  });
  if (error) throw new Error(`createBook: ${error.message}`);

  revalidatePath("/livros");
}

export async function updateBookStatus(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const status = z
    .enum(["TO_READ", "READING", "FINISHED", "ABANDONED"])
    .parse(readText(formData, "status"));
  const { userId, supabase } = await getCurrentUserContext();

  const update: Record<string, string | null> = { status };
  if (status === "READING") update.started_at = new Date().toISOString();
  if (status === "FINISHED") update.finished_at = new Date().toISOString();
  if (status === "READING") update.finished_at = null;

  const { error: updErr } = await supabase
    .from("books")
    .update(update)
    .eq("id", bookId);
  if (updErr) throw new Error(`updateBookStatus: ${updErr.message}`);

  const { error: logErr } = await supabase.from("book_logs").insert({
    user_id: userId,
    book_id: bookId,
    status,
  });
  if (logErr) throw new Error(`updateBookStatus(log): ${logErr.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/livros");
}

export async function deleteBook(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("books").delete().eq("id", bookId);
  if (error) throw new Error(`deleteBook: ${error.message}`);

  revalidatePath("/dashboard");
  revalidatePath("/livros");
}

// ---------- Movies ----------

export async function createMovie(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const genre = optionalText.parse(readText(formData, "genre"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("movies").insert({
    user_id: userId,
    title,
    genre: genre || null,
  });
  if (error) throw new Error(`createMovie: ${error.message}`);

  revalidatePath("/filmes");
}

export async function updateMovieStatus(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const status = z
    .enum(["TO_WATCH", "WATCHING", "WATCHED", "ABANDONED"])
    .parse(readText(formData, "status"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error: updErr } = await supabase
    .from("movies")
    .update({
      status,
      watched_at: status === "WATCHED" ? new Date().toISOString() : null,
    })
    .eq("id", movieId);
  if (updErr) throw new Error(`updateMovieStatus: ${updErr.message}`);

  const { error: logErr } = await supabase.from("movie_logs").insert({
    user_id: userId,
    movie_id: movieId,
    status,
  });
  if (logErr) throw new Error(`updateMovieStatus(log): ${logErr.message}`);

  revalidatePath("/filmes");
}

export async function deleteMovie(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("movies").delete().eq("id", movieId);
  if (error) throw new Error(`deleteMovie: ${error.message}`);

  revalidatePath("/filmes");
}

// ---------- Workouts ----------

export async function createWorkoutPlan(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("workout_plans").insert({
    user_id: userId,
    name,
    is_active: true,
  });
  if (error) throw new Error(`createWorkoutPlan: ${error.message}`);

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function deleteWorkoutPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("workout_plans")
    .delete()
    .eq("id", planId);
  if (error) throw new Error(`deleteWorkoutPlan: ${error.message}`);

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function createWorkoutDay(formData: FormData) {
  const planId = readId(formData, "planId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const weekDay = z.coerce
    .number()
    .int()
    .min(0)
    .max(6)
    .parse(readText(formData, "weekDay"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("workout_days").insert({
    workout_plan_id: planId,
    title,
    week_day: weekDay,
  });
  if (error) throw new Error(`createWorkoutDay: ${error.message}`);

  revalidatePath("/treinos");
}

export async function deleteWorkoutDay(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("workout_days")
    .delete()
    .eq("id", dayId);
  if (error) throw new Error(`deleteWorkoutDay: ${error.message}`);

  revalidatePath("/treinos");
}

function readOptionalText(formData: FormData, key: string) {
  const v = readText(formData, key).trim();
  return v.length ? v : null;
}

function readOptionalInt(formData: FormData, key: string) {
  const v = readText(formData, key).trim();
  if (!v.length) return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

export async function createWorkoutExercise(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const sets = readOptionalInt(formData, "sets");
  const reps = readOptionalText(formData, "reps");
  const load = readOptionalText(formData, "load");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("workout_exercises").insert({
    workout_day_id: dayId,
    name,
    sets,
    reps,
    load,
  });
  if (error) throw new Error(`createWorkoutExercise: ${error.message}`);

  revalidatePath("/treinos");
}

export async function deleteWorkoutExercise(formData: FormData) {
  const exerciseId = readId(formData, "exerciseId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", exerciseId);
  if (error) throw new Error(`deleteWorkoutExercise: ${error.message}`);

  revalidatePath("/treinos");
}

// ---------- Meals ----------

export async function createMealPlan(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("meal_plans").insert({
    user_id: userId,
    name,
    is_active: true,
  });
  if (error) throw new Error(`createMealPlan: ${error.message}`);

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function deleteMealPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("meal_plans")
    .delete()
    .eq("id", planId);
  if (error) throw new Error(`deleteMealPlan: ${error.message}`);

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function createMealSection(formData: FormData) {
  const planId = readId(formData, "planId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("meal_sections").insert({
    meal_plan_id: planId,
    title,
  });
  if (error) throw new Error(`createMealSection: ${error.message}`);

  revalidatePath("/dieta");
}

export async function deleteMealSection(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("meal_sections")
    .delete()
    .eq("id", sectionId);
  if (error) throw new Error(`deleteMealSection: ${error.message}`);

  revalidatePath("/dieta");
}

export async function createMealItem(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const description = nonEmptyText.parse(readText(formData, "description"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("meal_items").insert({
    meal_section_id: sectionId,
    description,
  });
  if (error) throw new Error(`createMealItem: ${error.message}`);

  revalidatePath("/dieta");
}

export async function deleteMealItem(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase
    .from("meal_items")
    .delete()
    .eq("id", itemId);
  if (error) throw new Error(`deleteMealItem: ${error.message}`);

  revalidatePath("/dieta");
}

// ---------- Medications & Exams ----------

export async function createMedication(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("medications").insert({
    user_id: userId,
    name,
    frequency_type: "DAILY",
  });
  if (error) throw new Error(`createMedication: ${error.message}`);

  revalidatePath("/remedios");
}

export async function createExam(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId, supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("exams").insert({
    user_id: userId,
    name,
    current_status: "PLANNED",
  });
  if (error) throw new Error(`createExam: ${error.message}`);

  revalidatePath("/exames");
}

export async function updateExam(formData: FormData) {
  const examId = readId(formData, "examId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("exams").update({ name }).eq("id", examId);
  if (error) throw new Error(`updateExam: ${error.message}`);
  revalidatePath("/exames");
}

export async function deleteExam(formData: FormData) {
  const examId = readId(formData, "examId");
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("exams").delete().eq("id", examId);
  if (error) throw new Error(`deleteExam: ${error.message}`);
  revalidatePath("/exames");
}

// ---------- Workouts (edits + toggle) ----------

export async function updateWorkoutPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("workout_plans").update({ name }).eq("id", planId);
  if (error) throw new Error(`updateWorkoutPlan: ${error.message}`);
  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function updateWorkoutDay(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const weekDayRaw = readText(formData, "weekDay").trim();
  const update: { title: string; week_day?: number } = { title };
  if (weekDayRaw.length) {
    update.week_day = z.coerce.number().int().min(0).max(6).parse(weekDayRaw);
  }
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("workout_days")
    .update(update)
    .eq("id", dayId);
  if (error) throw new Error(`updateWorkoutDay: ${error.message}`);
  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function updateWorkoutExercise(formData: FormData) {
  const exerciseId = readId(formData, "exerciseId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const sets = readOptionalInt(formData, "sets");
  const reps = readOptionalText(formData, "reps");
  const load = readOptionalText(formData, "load");
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("workout_exercises")
    .update({ name, sets, reps, load })
    .eq("id", exerciseId);
  if (error) throw new Error(`updateWorkoutExercise: ${error.message}`);
  revalidatePath("/treinos");
}

export async function toggleWorkoutExerciseForToday(formData: FormData) {
  const exerciseId = readId(formData, "exerciseId");
  const { userId, supabase } = await getCurrentUserContext();
  const occurredOn = todayDateIso();

  const { data: existing } = await supabase
    .from("workout_logs")
    .select("id, completed")
    .eq("workout_exercise_id", exerciseId)
    .eq("occurred_on", occurredOn)
    .maybeSingle();

  if (existing) {
    if (existing.completed) {
      const { error } = await supabase
        .from("workout_logs")
        .delete()
        .eq("id", existing.id);
      if (error) throw new Error(`toggleWorkoutExercise: ${error.message}`);
    } else {
      const { error } = await supabase
        .from("workout_logs")
        .update({ completed: true })
        .eq("id", existing.id);
      if (error) throw new Error(`toggleWorkoutExercise: ${error.message}`);
    }
  } else {
    const { error } = await supabase
      .from("workout_logs")
      .upsert(
        {
          user_id: userId,
          workout_exercise_id: exerciseId,
          occurred_on: occurredOn,
          completed: true,
        },
        { onConflict: "workout_exercise_id,occurred_on" },
      );
    if (error) throw new Error(`toggleWorkoutExercise: ${error.message}`);
  }

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function toggleWorkoutDayForToday(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const { userId, supabase } = await getCurrentUserContext();
  const occurredOn = todayDateIso();

  const { data: exercises, error: exErr } = await supabase
    .from("workout_exercises")
    .select("id")
    .eq("workout_day_id", dayId);
  if (exErr) throw new Error(`toggleWorkoutDay: ${exErr.message}`);

  const exerciseIds = (exercises ?? []).map((e: { id: string }) => e.id);
  if (!exerciseIds.length) {
    revalidatePath("/treinos");
    return;
  }

  const { data: logs, error: logErr } = await supabase
    .from("workout_logs")
    .select("workout_exercise_id, completed")
    .in("workout_exercise_id", exerciseIds)
    .eq("occurred_on", occurredOn);
  if (logErr) throw new Error(`toggleWorkoutDay: ${logErr.message}`);

  const completedCount = (logs ?? []).filter(
    (l: { completed: boolean }) => l.completed,
  ).length;
  const allDone = completedCount === exerciseIds.length;

  if (allDone) {
    const { error } = await supabase
      .from("workout_logs")
      .delete()
      .in("workout_exercise_id", exerciseIds)
      .eq("occurred_on", occurredOn);
    if (error) throw new Error(`toggleWorkoutDay: ${error.message}`);
  } else {
    const rows = exerciseIds.map((id) => ({
      user_id: userId,
      workout_exercise_id: id,
      occurred_on: occurredOn,
      completed: true,
    }));
    const { error } = await supabase
      .from("workout_logs")
      .upsert(rows, { onConflict: "workout_exercise_id,occurred_on" });
    if (error) throw new Error(`toggleWorkoutDay: ${error.message}`);
  }

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

// ---------- Meals (edits + toggle) ----------

export async function updateMealPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("meal_plans").update({ name }).eq("id", planId);
  if (error) throw new Error(`updateMealPlan: ${error.message}`);
  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function updateMealSection(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("meal_sections")
    .update({ title })
    .eq("id", sectionId);
  if (error) throw new Error(`updateMealSection: ${error.message}`);
  revalidatePath("/dieta");
}

export async function updateMealItem(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const description = nonEmptyText.parse(readText(formData, "description"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("meal_items")
    .update({ description })
    .eq("id", itemId);
  if (error) throw new Error(`updateMealItem: ${error.message}`);
  revalidatePath("/dieta");
}

export async function toggleMealForToday(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const { userId, supabase } = await getCurrentUserContext();
  const occurredOn = todayDateIso();

  const { data: existing, error: selErr } = await supabase
    .from("meal_logs")
    .select("id")
    .eq("meal_section_id", sectionId)
    .eq("occurred_on", occurredOn)
    .maybeSingle();
  if (selErr) throw new Error(`toggleMeal: ${selErr.message}`);

  if (existing) {
    const { error } = await supabase
      .from("meal_logs")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(`toggleMeal: ${error.message}`);
  } else {
    const { error } = await supabase.from("meal_logs").insert({
      user_id: userId,
      meal_section_id: sectionId,
      occurred_on: occurredOn,
      completed: true,
    });
    if (error) throw new Error(`toggleMeal: ${error.message}`);
  }

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

// ---------- Books / Movies (edit titles) ----------

export async function updateBook(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const author = optionalText.parse(readText(formData, "author"));
  const { supabase } = await getCurrentUserContext();

  const cover = await fetchBookCover(title, author).catch(() => null);

  const update: Record<string, string | null> = {
    title,
    author: author || null,
  };
  if (cover) update.cover_url = cover;

  const { error } = await supabase.from("books").update(update).eq("id", bookId);
  if (error) throw new Error(`updateBook: ${error.message}`);
  revalidatePath("/livros");
  revalidatePath("/dashboard");
}

export async function updateMovie(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const genre = optionalText.parse(readText(formData, "genre"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("movies")
    .update({ title, genre: genre || null })
    .eq("id", movieId);
  if (error) throw new Error(`updateMovie: ${error.message}`);
  revalidatePath("/filmes");
}

// ---------- Appointments / Reminders (edit) ----------

export async function updateAppointment(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const startsAtRaw = readText(formData, "startsAt");
  const update: Record<string, string> = { title };
  if (startsAtRaw) {
    update.starts_at = z.coerce.date().parse(startsAtRaw).toISOString();
  }
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("appointments")
    .update(update)
    .eq("id", appointmentId);
  if (error) throw new Error(`updateAppointment: ${error.message}`);
  revalidatePath("/compromissos");
  revalidatePath("/dashboard");
}

export async function updateReminder(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("reminders")
    .update({ title })
    .eq("id", reminderId);
  if (error) throw new Error(`updateReminder: ${error.message}`);
  revalidatePath("/lembretes");
}

// ---------- Medications (edit + delete) ----------

export async function updateMedication(formData: FormData) {
  const medicationId = readId(formData, "medicationId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("medications")
    .update({ name })
    .eq("id", medicationId);
  if (error) throw new Error(`updateMedication: ${error.message}`);
  revalidatePath("/remedios");
}

export async function deleteMedication(formData: FormData) {
  const medicationId = readId(formData, "medicationId");
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("medications")
    .delete()
    .eq("id", medicationId);
  if (error) throw new Error(`deleteMedication: ${error.message}`);
  revalidatePath("/remedios");
}

// ---------- Boards (listas customizaveis) ----------

const boardModelEnum = z.enum([
  "CHECKLIST",
  "CATALOG",
  "COUNTER",
  "SCHEDULE",
  "NOTE",
]);

export async function createBoard(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const model = boardModelEnum.parse(readText(formData, "model"));
  const icon = optionalText.parse(readText(formData, "icon")) || null;
  const { userId, supabase } = await getCurrentUserContext();

  const { data, error } = await supabase
    .from("boards")
    .insert({ user_id: userId, name, model, icon })
    .select("id")
    .maybeSingle();
  if (error) throw new Error(`createBoard: ${error.message}`);

  revalidatePath("/dashboard");
  if (data?.id) {
    redirect(`/lista/${data.id}`);
  }
}

export async function updateBoard(formData: FormData) {
  const boardId = readId(formData, "boardId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase
    .from("boards")
    .update({ name })
    .eq("id", boardId);
  if (error) throw new Error(`updateBoard: ${error.message}`);
  revalidatePath("/dashboard");
  revalidatePath(`/lista/${boardId}`);
}

export async function deleteBoard(formData: FormData) {
  const boardId = readId(formData, "boardId");
  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("boards").delete().eq("id", boardId);
  if (error) throw new Error(`deleteBoard: ${error.message}`);
  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createBoardItem(formData: FormData) {
  const boardId = readId(formData, "boardId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const description = optionalText.parse(readText(formData, "description"));
  const amountRaw = readText(formData, "amount");
  const occurredAtRaw = readText(formData, "occurredAt");

  const insert: Record<string, unknown> = {
    board_id: boardId,
    title,
    description: description || null,
  };

  if (amountRaw) {
    insert.amount = z.coerce.number().int().parse(amountRaw);
  }
  if (occurredAtRaw) {
    insert.occurred_at = z.coerce.date().parse(occurredAtRaw).toISOString();
  }

  const { supabase } = await getCurrentUserContext();
  const { error } = await supabase.from("board_items").insert(insert);
  if (error) throw new Error(`createBoardItem: ${error.message}`);

  revalidatePath(`/lista/${boardId}`);
}

export async function updateBoardItem(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const description = optionalText.parse(readText(formData, "description"));
  const { supabase } = await getCurrentUserContext();
  const { data: item } = await supabase
    .from("board_items")
    .select("board_id")
    .eq("id", itemId)
    .maybeSingle();
  const { error } = await supabase
    .from("board_items")
    .update({ title, description: description || null })
    .eq("id", itemId);
  if (error) throw new Error(`updateBoardItem: ${error.message}`);
  if (item?.board_id) revalidatePath(`/lista/${item.board_id}`);
}

export async function deleteBoardItem(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const { supabase } = await getCurrentUserContext();
  const { data: item } = await supabase
    .from("board_items")
    .select("board_id")
    .eq("id", itemId)
    .maybeSingle();
  const { error } = await supabase
    .from("board_items")
    .delete()
    .eq("id", itemId);
  if (error) throw new Error(`deleteBoardItem: ${error.message}`);
  if (item?.board_id) revalidatePath(`/lista/${item.board_id}`);
}

export async function toggleBoardItemForToday(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const occurredOn = todayDateIso();
  const { supabase } = await getCurrentUserContext();

  const { data: existing } = await supabase
    .from("board_item_logs")
    .select("id")
    .eq("board_item_id", itemId)
    .eq("occurred_on", occurredOn)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("board_item_logs")
      .delete()
      .eq("id", existing.id);
    if (error) throw new Error(`toggleBoardItem: ${error.message}`);
  } else {
    const { error } = await supabase.from("board_item_logs").insert({
      board_item_id: itemId,
      occurred_on: occurredOn,
      completed: true,
    });
    if (error) throw new Error(`toggleBoardItem: ${error.message}`);
  }

  const { data: item } = await supabase
    .from("board_items")
    .select("board_id")
    .eq("id", itemId)
    .maybeSingle();
  if (item?.board_id) revalidatePath(`/lista/${item.board_id}`);
}
