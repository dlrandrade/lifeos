import { Dumbbell, Plus } from "lucide-react";
import { CheckButton } from "@/components/check-button";
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
  toggleWorkoutDayForToday,
  toggleWorkoutExerciseForToday,
  updateWorkoutDay,
  updateWorkoutExercise,
  updateWorkoutPlan,
} from "@/server/actions";
import { getTreinosData } from "@/server/app-data";

const WEEK_DAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

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

  const { stats, groups, todayGroup, plan } = data;
  const todayPct =
    stats.todayTotal > 0
      ? Math.round((stats.todayDone / stats.todayTotal) * 100)
      : 0;

  return (
    <PageShell icon={Dumbbell}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Treino{" "}
          <span className="font-normal text-[var(--text-soft)]">de hoje</span>
        </h1>

        <MiniDashboard
          todayPct={todayPct}
          todayDone={stats.todayDone}
          todayTotal={stats.todayTotal}
          weekDaysCompleted={stats.weekDaysCompleted}
          weekDaysPlanned={stats.weekDaysPlanned}
          groups={groups}
        />

        {todayGroup ? (
          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold">
                  {todayGroup.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {todayGroup.doneCount}/{todayGroup.totalCount} exercicios
                </p>
              </div>
              {todayGroup.totalCount > 0 ? (
                <CheckButton
                  action={toggleWorkoutDayForToday}
                  hiddenFields={{ dayId: todayGroup.id }}
                  checked={todayGroup.allDone}
                  ariaLabel={
                    todayGroup.allDone
                      ? "Desmarcar treino de hoje"
                      : "Marcar treino completo"
                  }
                />
              ) : null}
            </div>
            <div className="mt-3 divide-y divide-[var(--line)]">
              {todayGroup.exercises.map((exercise) => (
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
                hiddenFields={{ dayId: todayGroup.id }}
                fields={[{ name: "name", placeholder: "Adicionar exercicio" }]}
                label="Adicionar exercicio"
              />
            </div>
          </section>
        ) : (
          <section className="mt-8 rounded-2xl bg-[var(--bg)] px-4 py-3">
            <p className="text-sm text-[var(--text-soft)]">
              Sem grupo definido para hoje ({data.todayLabel}). Crie abaixo.
            </p>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Grupos do plano
          </h2>
          <div className="mt-3 space-y-3">
            {groups
              .filter((g) => !g.isToday)
              .map((group) => (
                <details
                  key={group.id}
                  className="rounded-2xl bg-[var(--bg)] px-4 py-3"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden">
                    <div className="min-w-0">
                      <div className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                        {WEEK_DAY_SHORT[group.weekDay]}
                      </div>
                      <div
                        className={`truncate text-base font-bold ${
                          group.allDone
                            ? "text-[var(--text-muted)] line-through"
                            : ""
                        }`}
                      >
                        {group.title}
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {group.totalCount === 0
                          ? "sem exercicios"
                          : `${group.doneCount}/${group.totalCount} hoje`}
                      </div>
                    </div>
                    {group.totalCount > 0 ? (
                      <CheckButton
                        action={toggleWorkoutDayForToday}
                        hiddenFields={{ dayId: group.id }}
                        checked={group.allDone}
                        ariaLabel="Marcar grupo"
                      />
                    ) : null}
                  </summary>
                  <div className="mt-3 divide-y divide-[var(--line)]">
                    {group.exercises.map((exercise) => (
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
                          fields: [
                            { name: "name", defaultValue: exercise.name },
                          ],
                        }}
                        remove={{
                          action: deleteWorkoutExercise,
                          hiddenFields: { exerciseId: exercise.id },
                        }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <InlineAdd
                      action={createWorkoutExercise}
                      hiddenFields={{ dayId: group.id }}
                      fields={[
                        { name: "name", placeholder: "Adicionar exercicio" },
                      ]}
                      label="Exercicio"
                    />
                    <details className="relative">
                      <summary className="list-none cursor-pointer text-xs text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
                        editar
                      </summary>
                      <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
                        <form action={updateWorkoutDay} className="space-y-2">
                          <input type="hidden" name="dayId" value={group.id} />
                          <input
                            name="title"
                            defaultValue={group.title}
                            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                          />
                          <button
                            type="submit"
                            className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
                          >
                            Salvar
                          </button>
                        </form>
                        <form action={deleteWorkoutDay} className="mt-2">
                          <input type="hidden" name="dayId" value={group.id} />
                          <button
                            type="submit"
                            className="w-full rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                          >
                            Excluir grupo
                          </button>
                        </form>
                      </div>
                    </details>
                  </div>
                </details>
              ))}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-[var(--line)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Novo grupo
            </p>
            <form
              action={createWorkoutDay}
              className="mt-2 flex flex-col gap-2 sm:flex-row"
            >
              <input type="hidden" name="planId" value={plan.id} />
              <input
                name="title"
                placeholder="Titulo (ex.: Peito e triceps)"
                required
                className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <select
                name="weekDay"
                required
                defaultValue=""
                className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              >
                <option value="" disabled>
                  Dia
                </option>
                {WEEK_DAY_SHORT.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                aria-label="Criar grupo"
                className="flex items-center justify-center gap-2 rounded-full bg-[var(--text)] px-4 py-2 text-xs font-semibold text-white"
              >
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                Criar
              </button>
            </form>
          </div>
        </section>

        <details className="mt-8">
          <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
            {plan.name} • plano
          </summary>
          <div className="mt-2 space-y-2">
            <form action={updateWorkoutPlan} className="flex gap-2">
              <input type="hidden" name="planId" value={plan.id} />
              <input
                name="name"
                defaultValue={plan.name}
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
              <input type="hidden" name="planId" value={plan.id} />
              <button
                type="submit"
                className="text-xs text-red-600 hover:underline"
              >
                Excluir plano
              </button>
            </form>
          </div>
        </details>
      </InnerCard>
    </PageShell>
  );
}

function MiniDashboard({
  todayPct,
  todayDone,
  todayTotal,
  weekDaysCompleted,
  weekDaysPlanned,
  groups,
}: {
  todayPct: number;
  todayDone: number;
  todayTotal: number;
  weekDaysCompleted: number;
  weekDaysPlanned: number;
  groups: Array<{ weekDay: number; allDone: boolean; totalCount: number }>;
}) {
  const today = new Date().getDay();
  const dotColor = (i: number) => {
    const g = groups.find((g) => g.weekDay === i);
    if (!g || g.totalCount === 0) return "bg-[var(--check)]/40";
    if (g.allDone) return "bg-[var(--text)]";
    if (i === today) return "bg-[var(--text-muted)]";
    return "bg-[var(--check)]";
  };

  return (
    <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-[var(--bg)] px-4 py-3 text-xs">
      <div>
        <div className="text-[var(--text-muted)] uppercase tracking-wider">
          hoje
        </div>
        <div className="mt-1 text-base font-bold">
          {todayDone}/{todayTotal}
        </div>
        <div className="mt-1 h-1.5 w-full rounded-full bg-[var(--check)]/50">
          <div
            className="h-1.5 rounded-full bg-[var(--text)]"
            style={{ width: `${todayPct}%` }}
          />
        </div>
      </div>
      <div>
        <div className="text-[var(--text-muted)] uppercase tracking-wider">
          semana
        </div>
        <div className="mt-1 text-base font-bold">
          {weekDaysCompleted}/{weekDaysPlanned}
        </div>
        <div className="mt-1 text-[10px] text-[var(--text-muted)]">
          dias treinados
        </div>
      </div>
      <div>
        <div className="text-[var(--text-muted)] uppercase tracking-wider">
          rotina
        </div>
        <div className="mt-2 flex items-center gap-1">
          {WEEK_DAY_SHORT.map((label, i) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span
                aria-label={label}
                className={`h-2 w-2 rounded-full ${dotColor(i)}`}
              />
              <span className="text-[9px] text-[var(--text-muted)]">
                {label[0]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
