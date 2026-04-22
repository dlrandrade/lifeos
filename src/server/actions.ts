"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
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

async function ensureTaskOwner(taskId: string, userId: string) {
  await db.task.findFirstOrThrow({ where: { id: taskId, userId } });
}

async function ensureWaterLogOwner(logId: string, userId: string) {
  await db.waterLog.findFirstOrThrow({ where: { id: logId, userId } });
}

async function ensureAppointmentOwner(appointmentId: string, userId: string) {
  await db.appointment.findFirstOrThrow({ where: { id: appointmentId, userId } });
}

async function ensureReminderOwner(reminderId: string, userId: string) {
  await db.reminder.findFirstOrThrow({ where: { id: reminderId, userId } });
}

async function ensureBookOwner(bookId: string, userId: string) {
  await db.book.findFirstOrThrow({ where: { id: bookId, userId } });
}

async function ensureMovieOwner(movieId: string, userId: string) {
  await db.movie.findFirstOrThrow({ where: { id: movieId, userId } });
}

async function ensureWorkoutPlanOwner(planId: string, userId: string) {
  await db.workoutPlan.findFirstOrThrow({ where: { id: planId, userId } });
}

async function ensureWorkoutDayOwner(dayId: string, userId: string) {
  await db.workoutDay.findFirstOrThrow({
    where: {
      id: dayId,
      workoutPlan: { userId },
    },
  });
}

async function ensureWorkoutExerciseOwner(exerciseId: string, userId: string) {
  await db.workoutExercise.findFirstOrThrow({
    where: {
      id: exerciseId,
      workoutDay: { workoutPlan: { userId } },
    },
  });
}

async function ensureMealPlanOwner(planId: string, userId: string) {
  await db.mealPlan.findFirstOrThrow({ where: { id: planId, userId } });
}

async function ensureMealSectionOwner(sectionId: string, userId: string) {
  await db.mealSection.findFirstOrThrow({
    where: {
      id: sectionId,
      mealPlan: { userId },
    },
  });
}

async function ensureMealItemOwner(itemId: string, userId: string) {
  await db.mealItem.findFirstOrThrow({
    where: {
      id: itemId,
      mealSection: { mealPlan: { userId } },
    },
  });
}

export async function createTask(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId } = await getCurrentUserContext();

  await db.task.create({
    data: {
      userId,
      title,
      isRecurring: true,
    },
  });

  revalidatePath("/dashboard");
}

export async function toggleTaskForToday(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const { userId } = await getCurrentUserContext();
  await ensureTaskOwner(taskId, userId);
  const occurredOn = new Date();
  occurredOn.setHours(0, 0, 0, 0);

  const existing = await db.taskLog.findUnique({
    where: {
      taskId_occurredOn: {
        taskId,
        occurredOn,
      },
    },
  });

  if (existing) {
    await db.taskLog.delete({
      where: {
        taskId_occurredOn: {
          taskId,
          occurredOn,
        },
      },
    });
  } else {
    await db.taskLog.create({
      data: {
        userId,
        taskId,
        occurredOn,
        completed: true,
      },
    });
  }

  revalidatePath("/dashboard");
}

export async function deleteTask(formData: FormData) {
  const taskId = readId(formData, "taskId");
  const { userId } = await getCurrentUserContext();
  await ensureTaskOwner(taskId, userId);

  await db.task.delete({
    where: { id: taskId },
  });

  revalidatePath("/dashboard");
}

export async function addWaterLog(formData: FormData) {
  const amountMl = z.coerce.number().int().positive().parse(readText(formData, "amountMl"));
  const { userId } = await getCurrentUserContext();

  await db.waterLog.create({
    data: {
      userId,
      amountMl,
      occurredAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/hidratacao");
}

export async function deleteWaterLog(formData: FormData) {
  const logId = readId(formData, "logId");
  const { userId } = await getCurrentUserContext();
  await ensureWaterLogOwner(logId, userId);

  await db.waterLog.delete({
    where: { id: logId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/hidratacao");
}

export async function createAppointment(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const startsAt = z.coerce.date().parse(readText(formData, "startsAt"));
  const { userId } = await getCurrentUserContext();

  await db.appointment.create({
    data: {
      userId,
      title,
      startsAt,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function updateAppointmentStatus(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const status = z.enum(["SCHEDULED", "DONE", "CANCELED"]).parse(readText(formData, "status"));
  const { userId } = await getCurrentUserContext();
  await ensureAppointmentOwner(appointmentId, userId);

  await db.appointment.update({
    where: { id: appointmentId },
    data: { status },
  });

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function deleteAppointment(formData: FormData) {
  const appointmentId = readId(formData, "appointmentId");
  const { userId } = await getCurrentUserContext();
  await ensureAppointmentOwner(appointmentId, userId);

  await db.appointment.delete({
    where: { id: appointmentId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/compromissos");
}

export async function createReminder(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId } = await getCurrentUserContext();

  await db.reminder.create({
    data: {
      userId,
      title,
    },
  });

  revalidatePath("/lembretes");
}

export async function updateReminderStatus(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const status = z.enum(["PENDING", "DONE", "CANCELED"]).parse(readText(formData, "status"));
  const { userId } = await getCurrentUserContext();
  await ensureReminderOwner(reminderId, userId);

  await db.reminder.update({
    where: { id: reminderId },
    data: { status },
  });

  revalidatePath("/lembretes");
}

export async function deleteReminder(formData: FormData) {
  const reminderId = readId(formData, "reminderId");
  const { userId } = await getCurrentUserContext();
  await ensureReminderOwner(reminderId, userId);

  await db.reminder.delete({
    where: { id: reminderId },
  });

  revalidatePath("/lembretes");
}

export async function createBook(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const author = optionalText.parse(readText(formData, "author"));
  const { userId } = await getCurrentUserContext();

  await db.book.create({
    data: {
      userId,
      title,
      author: author || null,
    },
  });

  revalidatePath("/livros");
}

export async function updateBookStatus(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const status = z.enum(["TO_READ", "READING", "FINISHED", "ABANDONED"]).parse(
    readText(formData, "status"),
  );
  const { userId } = await getCurrentUserContext();
  await ensureBookOwner(bookId, userId);

  await db.book.update({
    where: { id: bookId },
    data: {
      status,
      startedAt: status === "READING" ? new Date() : undefined,
      finishedAt: status === "FINISHED" ? new Date() : status === "READING" ? null : undefined,
    },
  });

  await db.bookLog.create({
    data: {
      userId,
      bookId,
      status,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/livros");
}

export async function deleteBook(formData: FormData) {
  const bookId = readId(formData, "bookId");
  const { userId } = await getCurrentUserContext();
  await ensureBookOwner(bookId, userId);

  await db.book.delete({
    where: { id: bookId },
  });

  revalidatePath("/dashboard");
  revalidatePath("/livros");
}

export async function createMovie(formData: FormData) {
  const title = nonEmptyText.parse(readText(formData, "title"));
  const genre = optionalText.parse(readText(formData, "genre"));
  const { userId } = await getCurrentUserContext();

  await db.movie.create({
    data: {
      userId,
      title,
      genre: genre || null,
    },
  });

  revalidatePath("/filmes");
}

export async function updateMovieStatus(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const status = z.enum(["TO_WATCH", "WATCHING", "WATCHED", "ABANDONED"]).parse(
    readText(formData, "status"),
  );
  const { userId } = await getCurrentUserContext();
  await ensureMovieOwner(movieId, userId);

  await db.movie.update({
    where: { id: movieId },
    data: {
      status,
      watchedAt: status === "WATCHED" ? new Date() : null,
    },
  });

  await db.movieLog.create({
    data: {
      userId,
      movieId,
      status,
    },
  });

  revalidatePath("/filmes");
}

export async function deleteMovie(formData: FormData) {
  const movieId = readId(formData, "movieId");
  const { userId } = await getCurrentUserContext();
  await ensureMovieOwner(movieId, userId);

  await db.movie.delete({
    where: { id: movieId },
  });

  revalidatePath("/filmes");
}

export async function createWorkoutPlan(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();

  await db.workoutPlan.create({
    data: {
      userId,
      name,
      isActive: true,
    },
  });

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function deleteWorkoutPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutPlanOwner(planId, userId);

  await db.workoutPlan.delete({
    where: { id: planId },
  });

  revalidatePath("/treinos");
  revalidatePath("/dashboard");
}

export async function createWorkoutDay(formData: FormData) {
  const planId = readId(formData, "planId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const weekDay = z.coerce.number().int().min(0).max(6).parse(readText(formData, "weekDay"));
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutPlanOwner(planId, userId);

  await db.workoutDay.create({
    data: {
      workoutPlanId: planId,
      title,
      weekDay,
    },
  });

  revalidatePath("/treinos");
}

export async function deleteWorkoutDay(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutDayOwner(dayId, userId);
  await db.workoutDay.delete({ where: { id: dayId } });
  revalidatePath("/treinos");
}

export async function createWorkoutExercise(formData: FormData) {
  const dayId = readId(formData, "dayId");
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutDayOwner(dayId, userId);

  await db.workoutExercise.create({
    data: {
      workoutDayId: dayId,
      name,
    },
  });

  revalidatePath("/treinos");
}

export async function deleteWorkoutExercise(formData: FormData) {
  const exerciseId = readId(formData, "exerciseId");
  const { userId } = await getCurrentUserContext();
  await ensureWorkoutExerciseOwner(exerciseId, userId);
  await db.workoutExercise.delete({ where: { id: exerciseId } });
  revalidatePath("/treinos");
}

export async function createMealPlan(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();

  await db.mealPlan.create({
    data: {
      userId,
      name,
      isActive: true,
    },
  });

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function deleteMealPlan(formData: FormData) {
  const planId = readId(formData, "planId");
  const { userId } = await getCurrentUserContext();
  await ensureMealPlanOwner(planId, userId);

  await db.mealPlan.delete({
    where: { id: planId },
  });

  revalidatePath("/dieta");
  revalidatePath("/dashboard");
}

export async function createMealSection(formData: FormData) {
  const planId = readId(formData, "planId");
  const title = nonEmptyText.parse(readText(formData, "title"));
  const { userId } = await getCurrentUserContext();
  await ensureMealPlanOwner(planId, userId);

  await db.mealSection.create({
    data: {
      mealPlanId: planId,
      title,
    },
  });

  revalidatePath("/dieta");
}

export async function deleteMealSection(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const { userId } = await getCurrentUserContext();
  await ensureMealSectionOwner(sectionId, userId);
  await db.mealSection.delete({ where: { id: sectionId } });
  revalidatePath("/dieta");
}

export async function createMealItem(formData: FormData) {
  const sectionId = readId(formData, "sectionId");
  const description = nonEmptyText.parse(readText(formData, "description"));
  const { userId } = await getCurrentUserContext();
  await ensureMealSectionOwner(sectionId, userId);

  await db.mealItem.create({
    data: {
      mealSectionId: sectionId,
      description,
    },
  });

  revalidatePath("/dieta");
}

export async function deleteMealItem(formData: FormData) {
  const itemId = readId(formData, "itemId");
  const { userId } = await getCurrentUserContext();
  await ensureMealItemOwner(itemId, userId);
  await db.mealItem.delete({ where: { id: itemId } });
  revalidatePath("/dieta");
}

export async function createMedication(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();

  await db.medication.create({
    data: {
      userId,
      name,
      frequencyType: "DAILY",
    },
  });

  revalidatePath("/remedios");
}

export async function createExam(formData: FormData) {
  const name = nonEmptyText.parse(readText(formData, "name"));
  const { userId } = await getCurrentUserContext();

  await db.exam.create({
    data: {
      userId,
      name,
      currentStatus: "PLANNED",
    },
  });

  revalidatePath("/exames");
}
