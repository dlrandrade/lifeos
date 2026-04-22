import prismaPkg from "@prisma/client";

const { PrismaClient } = prismaPkg;
const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL ?? "demo@lst.app";

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      profile: {
        create: {
          fullName: "Daniel",
          timezone: "America/Recife",
          dailyWaterGoal: 2500,
        },
      },
      waterGoal: {
        create: { dailyGoalMl: 2500 },
      },
    },
  });

  const taskCount = await prisma.task.count({ where: { userId: user.id } });
  if (!taskCount) {
    await prisma.task.createMany({
      data: [
        { userId: user.id, title: "Beber agua", isRecurring: true, sortOrder: 1 },
        { userId: user.id, title: "Tomar creatina", isRecurring: true, sortOrder: 2 },
        { userId: user.id, title: "Ler 20 paginas", isRecurring: true, sortOrder: 3 },
      ],
    });
  }

  const workoutCount = await prisma.workoutPlan.count({ where: { userId: user.id } });
  if (!workoutCount) {
    await prisma.workoutPlan.create({
      data: {
        userId: user.id,
        name: "Hipertrofia Abril",
        days: {
          create: [
            {
              weekDay: 1,
              title: "Peito e triceps",
              sortOrder: 1,
              exercises: {
                create: [
                  { name: "Supino reto", sortOrder: 1 },
                  { name: "Supino inclinado", sortOrder: 2 },
                  { name: "Triceps maquina", sortOrder: 3 },
                ],
              },
            },
          ],
        },
      },
    });
  }

  const mealCount = await prisma.mealPlan.count({ where: { userId: user.id } });
  if (!mealCount) {
    await prisma.mealPlan.create({
      data: {
        userId: user.id,
        name: "Dieta Abril",
        referenceMonth: 4,
        referenceYear: 2026,
        sections: {
          create: [
            {
              title: "Cafe da manha",
              sortOrder: 1,
              items: {
                create: [
                  { description: "3 ovos", sortOrder: 1 },
                  { description: "1 fruta", sortOrder: 2 },
                ],
              },
            },
            {
              title: "Almoco",
              sortOrder: 2,
              items: {
                create: [
                  { description: "300g de proteina", sortOrder: 1 },
                  { description: "300g de carboidrato", sortOrder: 2 },
                ],
              },
            },
          ],
        },
      },
    });
  }

  await prisma.book.upsert({
    where: { id: "seed-book-mestria" },
    update: {},
    create: {
      id: "seed-book-mestria",
      userId: user.id,
      title: "Mestria",
      author: "Robert Greene",
      status: "READING",
      yearBucket: 2026,
    },
  });

  await prisma.movie.upsert({
    where: { id: "seed-movie-dune" },
    update: {},
    create: {
      id: "seed-movie-dune",
      userId: user.id,
      title: "Dune: Part Two",
      genre: "Sci-Fi",
      status: "TO_WATCH",
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
