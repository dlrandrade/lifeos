import { Dumbbell } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import {
  createWorkoutDay,
  createWorkoutExercise,
  createWorkoutPlan,
  deleteWorkoutDay,
  deleteWorkoutExercise,
  deleteWorkoutPlan,
  toggleWorkoutExerciseForToday,
  updateWorkoutDay,
  updateWorkoutExercise,
  updateWorkoutPlan,
} from "@/server/actions";
import { getTreinosData } from "@/server/app-data";

const WEEK_DAY_NAMES = [
  "Domingo",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sabado",
];

export default async function TreinosPage() {
  const data = await getTreinosData();

  if (!data.plan) {
    return (
      <PageShell icon={Dumbbell}>
        <InnerCard>
          <h1 className="text-3xl font-bold tracking-tight">Treino</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Crie um plano para comecar.
          </p>
          <div className="mt-6">
            <InlineAdd
              action={createWorkoutPlan}
              fields={[{ name: "name", placeholder: "Ex.: Hipertrofia Abril" }]}
              label="Novo plano"
            />
          </div>
        </InnerCard>
      </PageShell>
    );
  }

  return (
    <PageShell icon={Dumbbell}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Treino{" "}
          <span className="font-normal text-[var(--text-soft)]">de hoje</span>
        </h1>

        {data.today.id ? (
          <>
            <h2 className="mt-8 text-base font-bold">{data.today.title}</h2>
            <div className="mt-3 divide-y divide-[var(--line)]">
              {data.today.exercises.map((exercise) => (
                <ItemRow
                  key={exercise.id}
                  title={exercise.name}
                  toggle={{
                    action: toggleWorkoutExerciseForToday,
                    hiddenFields: { exerciseId: exercise.id },
                    checked: exercise.completed,
                  }}
                  edit={{
                    action: updateWorkoutExercise,
                    hiddenFields: { exerciseId: exercise.id },
                    fields: [{ name: "name", defaultValue: exercise.name }],
                  }}
                  remove={{
                    action: deleteWorkoutExercise,
                    hiddenFields: { exerciseId: exercise.id },
                  }}
                />
              ))}
            </div>
            <div className="mt-2">
              <InlineAdd
                action={createWorkoutExercise}
                hiddenFields={{ dayId: data.today.id }}
                fields={[{ name: "name", placeholder: "Ex.: Supino reto" }]}
                label="Adicionar exercicio"
              />
            </div>
          </>
        ) : (
          <div className="mt-8">
            <p className="text-sm text-[var(--text-muted)]">
              Sem treino para hoje (
              {WEEK_DAY_NAMES[data.today.weekDay]}).
            </p>
            <div className="mt-3">
              <InlineAdd
                action={createWorkoutDay}
                hiddenFields={{ planId: data.plan.id }}
                fields={[
                  { name: "title", placeholder: "Titulo (ex.: Peito e triceps)" },
                  {
                    name: "weekDay",
                    placeholder: "Dia da semana (0=Dom, 1=Seg, ...)",
                    type: "number",
                  },
                ]}
                label="Criar dia"
              />
            </div>
          </div>
        )}

        {data.otherDays.length ? (
          <div className="mt-10 space-y-1.5">
            {data.otherDays.map((day) => (
              <ItemRow
                key={day.id}
                title={day.title}
                faded
                bold
                edit={{
                  action: updateWorkoutDay,
                  hiddenFields: { dayId: day.id },
                  fields: [
                    { name: "title", defaultValue: day.title },
                  ],
                }}
                remove={{
                  action: deleteWorkoutDay,
                  hiddenFields: { dayId: day.id },
                }}
              />
            ))}
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <details>
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
              {data.plan.name} • editar
            </summary>
            <div className="mt-2 space-y-2">
              <form action={updateWorkoutPlan} className="flex gap-2">
                <input type="hidden" name="planId" value={data.plan.id} />
                <input
                  name="name"
                  defaultValue={data.plan.name}
                  className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
                >
                  Salvar
                </button>
              </form>
              <form action={deleteWorkoutPlan}>
                <input type="hidden" name="planId" value={data.plan.id} />
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  Excluir plano
                </button>
              </form>
            </div>
          </details>

          <InlineAdd
            action={createWorkoutDay}
            hiddenFields={{ planId: data.plan.id }}
            fields={[
              { name: "title", placeholder: "Titulo do dia" },
              {
                name: "weekDay",
                placeholder: "0=Dom 1=Seg 2=Ter ...",
                type: "number",
              },
            ]}
            label="Novo dia"
            variant="fab"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}
