import { startOfDay } from "date-fns";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";

function inferName(email: string, fullName?: string | null) {
  if (fullName?.trim()) {
    return fullName.trim();
  }

  return email.split("@")[0] || "Usuario";
}

export async function getCurrentUserContext() {
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

  await db.user.upsert({
    where: { id: userId },
    update: {
      email: authUser.email,
    },
    create: {
      id: userId,
      email: authUser.email,
    },
  });

  await db.profile.upsert({
    where: { userId },
    update: {
      fullName: inferName(authUser.email, fullName),
    },
    create: {
      userId,
      fullName: inferName(authUser.email, fullName),
      timezone: "America/Recife",
      dailyWaterGoal: 2500,
    },
  });

  await db.waterGoal.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      dailyGoalMl: 2500,
    },
  });

  const user = await db.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      profile: true,
      waterGoal: true,
    },
  });

  return { userId, user };
}

export async function getDashboardData() {
  const { userId, user } = await getCurrentUserContext();
  const today = startOfDay(new Date());

  const [tasks, taskLogs, waterLogs, workoutPlan, mealPlan, currentBook, appointments] =
    await Promise.all([
      db.task.findMany({
        where: { userId, status: "ACTIVE" },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        take: 6,
      }),
      db.taskLog.findMany({
        where: { userId, occurredOn: today },
      }),
      db.waterLog.findMany({
        where: { userId, occurredAt: { gte: today } },
      }),
      db.workoutPlan.findFirst({
        where: { userId, isActive: true },
        include: {
          days: {
            orderBy: { weekDay: "asc" },
            include: {
              exercises: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      }),
      db.mealPlan.findFirst({
        where: { userId, isActive: true },
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      }),
      db.book.findFirst({
        where: { userId, status: "READING" },
        orderBy: { updatedAt: "desc" },
      }),
      db.appointment.findMany({
        where: { userId, startsAt: { gte: today } },
        orderBy: { startsAt: "asc" },
        take: 3,
      }),
    ]);

  const completedTaskIds = new Set(
    taskLogs.filter((item) => item.completed).map((item) => item.taskId),
  );
  const waterConsumed = waterLogs.reduce((sum, entry) => sum + entry.amountMl, 0);

  return {
    userName: user.profile?.fullName ?? "Daniel",
    dateLabel: today,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      completed: completedTaskIds.has(task.id),
    })),
    highlights: [
      {
        title: "Treino de hoje",
        value: workoutPlan?.days.find((day) => day.weekDay === new Date().getDay())?.exercises
          .length
          ? `${workoutPlan.days.find((day) => day.weekDay === new Date().getDay())?.exercises.length} exercicios`
          : "Sem treino hoje",
        meta: workoutPlan?.name ?? "Nenhum plano ativo",
      },
      {
        title: "Dieta ativa",
        value: `${mealPlan?.sections.length ?? 0} refeicoes`,
        meta: mealPlan?.name ?? "Sem plano ativo",
      },
      {
        title: "Hidratacao",
        value: `${waterConsumed}ml / ${user.waterGoal?.dailyGoalMl ?? 2500}ml`,
        meta: "Consumo de hoje",
      },
      {
        title: "Compromissos",
        value: `${appointments.length} hoje`,
        meta: appointments[0]?.title ?? "Agenda livre",
      },
    ],
    currentBook,
    appointments,
    waterConsumed,
    waterGoal: user.waterGoal?.dailyGoalMl ?? 2500,
  };
}

export async function getModuleData(slug: string) {
  const { userId } = await getCurrentUserContext();

  switch (slug) {
    case "treinos": {
      const plan = await db.workoutPlan.findFirst({
        where: { userId, isActive: true },
        include: {
          days: {
            orderBy: { weekDay: "asc" },
            include: { exercises: { orderBy: { sortOrder: "asc" } } },
          },
        },
      });

      return {
        planId: plan?.id ?? null,
        sections:
          plan?.days.map((day) => ({
            id: day.id,
            title: day.title || `Dia ${day.weekDay}`,
            subtitle: `Dia ${day.weekDay}`,
            items: day.exercises.map((exercise) => ({
              id: exercise.id,
              title: exercise.name,
              subtitle: exercise.notes ?? "",
            })),
          })) ?? [],
        countLabel: `${plan?.days.length ?? 0} dias configurados`,
        records:
          plan?.days.map((day) => ({
            id: day.id,
            title: day.title || `Dia ${day.weekDay}`,
            subtitle: `${day.exercises.length} exercicios`,
          })) ?? [],
      };
    }
    case "dieta": {
      const plan = await db.mealPlan.findFirst({
        where: { userId, isActive: true },
        include: {
          sections: {
            orderBy: { sortOrder: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      });

      return {
        planId: plan?.id ?? null,
        sections:
          plan?.sections.map((section) => ({
            id: section.id,
            title: section.title,
            subtitle: `${section.items.length} itens`,
            items: section.items.map((item) => ({
              id: item.id,
              title: item.description,
              subtitle: "",
            })),
          })) ?? [],
        countLabel: `${plan?.sections.length ?? 0} refeicoes`,
        records:
          plan?.sections.map((section) => ({
            id: section.id,
            title: section.title,
            subtitle: `${section.items.length} itens`,
          })) ?? [],
      };
    }
    case "livros": {
      const books = await db.book.findMany({
        where: { userId },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 12,
      });

      return {
        countLabel: `${books.length} livros`,
        records: books.map((book) => ({
          id: book.id,
          title: book.title,
          subtitle: `${book.author ?? "Autor indefinido"} • ${book.status}`,
          status: book.status,
        })),
      };
    }
    case "filmes": {
      const movies = await db.movie.findMany({
        where: { userId },
        orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
        take: 12,
      });

      return {
        countLabel: `${movies.length} filmes`,
        records: movies.map((movie) => ({
          id: movie.id,
          title: movie.title,
          subtitle: `${movie.genre ?? "Genero livre"} • ${movie.status}`,
          status: movie.status,
        })),
      };
    }
    case "hidratacao": {
      const logs = await db.waterLog.findMany({
        where: { userId, occurredAt: { gte: startOfDay(new Date()) } },
        orderBy: { occurredAt: "desc" },
      });

      return {
        countLabel: `${logs.reduce((sum, item) => sum + item.amountMl, 0)}ml hoje`,
        records: logs.map((log) => ({
          id: log.id,
          title: `${log.amountMl}ml`,
          subtitle: log.occurredAt.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      };
    }
    case "compromissos": {
      const items = await db.appointment.findMany({
        where: { userId },
        orderBy: { startsAt: "asc" },
        take: 12,
      });

      return {
        countLabel: `${items.length} registros`,
        records: items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: `${item.startsAt.toLocaleDateString("pt-BR")} • ${item.status}`,
          status: item.status,
        })),
      };
    }
    case "lembretes": {
      const items = await db.reminder.findMany({
        where: { userId },
        orderBy: [{ status: "asc" }, { dueAt: "asc" }],
        take: 12,
      });

      return {
        countLabel: `${items.length} lembretes`,
        records: items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: `${item.priority} • ${item.status}`,
          status: item.status,
        })),
      };
    }
    case "remedios": {
      const items = await db.medication.findMany({
        where: { userId, isActive: true },
        orderBy: { createdAt: "desc" },
        include: { schedules: true },
        take: 12,
      });

      return {
        countLabel: `${items.length} remedios ativos`,
        records: items.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: `${item.schedules.length} horarios • ${item.frequencyType}`,
        })),
      };
    }
    case "exames": {
      const items = await db.exam.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 12,
      });

      return {
        countLabel: `${items.length} exames`,
        records: items.map((item) => ({
          id: item.id,
          title: item.name,
          subtitle: `${item.currentStatus} • ${item.category ?? "Geral"}`,
        })),
      };
    }
    default:
      return {
        countLabel: "0 itens",
        records: [],
      };
  }
}
