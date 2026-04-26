"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUserContext } from "@/server/app-data";

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

  const { error } = await supabase.from("books").insert({
    user_id: userId,
    title,
    author: author || null,
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

export async function createWorkoutExercise(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { supabase } = await getCurrentUserContext();

  const { error } = await supabase.from("workout_exercises").insert({
    workout_day_id: dayId,
    name,
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
