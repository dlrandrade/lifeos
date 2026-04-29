import { Dumbbell, Flame, Plus } from "lucide-react";
import { CheckButton } from "@/components/check-button";
import { PageShell, InnerCard } from "@/components/page-shell";
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
import {
  getTreinosData,
  type TreinosExercise,
  type TreinosGroup,
} from "@/server/app-data";

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
          <form action={createWorkoutPlan} className="mt-6 flex gap-2">
            <input
              name="name"
              placeholder="Ex.: Hipertrofia Abril"
              required
              className="flex-1 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-[var(--text)] px-4 py-2 text-xs font-semibold text-white"
            >
              Criar plano
            </button>
          </form>
        </InnerCard>
      </PageShell>
    );
  }

  const { stats, groups, todayGroups, plan } = data;
  const todayPct =
    stats.todayTotal > 0
      ? Math.round((stats.todayDone / stats.todayTotal) * 100)
      : 0;

  const otherGroups = groups.filter((g) => !g.isToday);

  return (
    <PageShell icon={Dumbbell}>
      <InnerCard>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Treino{" "}
              <span className="font-normal text-[var(--text-soft)]">
                de hoje
              </span>
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {plan.name}
            </p>
          </div>
          {stats.streak > 0 ? (
            <div className="flex items-center gap-1 rounded-full bg-[var(--bg)] px-3 py-1 text-xs text-[var(--text-soft)]">
              <Flame className="h-3.5 w-3.5" strokeWidth={1.7} />
              <span className="font-bold">{stats.streak}</span>
              <span className="text-[var(--text-muted)]">
                {stats.streak === 1 ? "dia" : "dias"}
              </span>
            </div>
          ) : null}
        </div>

        <MiniDashboard
          todayPct={todayPct}
          todayDone={stats.todayDone}
          todayTotal={stats.todayTotal}
          weekDaysCompleted={stats.weekDaysCompleted}
          weekDaysPlanned={stats.weekDaysPlanned}
          monthTrainedDays={stats.monthTrainedDays}
          last7={stats.last7}
        />

        {todayGroups.length ? (
          <section className="mt-8 space-y-6">
            {todayGroups.map((group) => (
              <GroupBlock key={group.id} group={group} primary />
            ))}
          </section>
        ) : (
          <section className="mt-8 rounded-2xl bg-[var(--bg)] px-4 py-3">
            <p className="text-sm text-[var(--text-soft)]">
              Sem grupo definido para hoje ({data.todayLabel}). Crie abaixo ou
              veja os outros dias.
            </p>
          </section>
        )}

        {otherGroups.length ? (
          <section className="mt-10">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              Outros grupos
            </h2>
            <div className="mt-3 space-y-3">
              {otherGroups.map((group) => (
                <GroupBlock key={group.id} group={group} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-6 rounded-2xl border border-dashed border-[var(--line)] px-4 py-3">
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

function GroupBlock({
  group,
  primary,
}: {
  group: TreinosGroup;
  primary?: boolean;
}) {
  const headerWrap = primary
    ? "flex items-center justify-between gap-3"
    : "flex cursor-pointer items-center justify-between gap-3 list-none [&::-webkit-details-marker]:hidden";

  const Header = (
    <>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          {WEEK_DAY_SHORT[group.weekDay]}
        </div>
        <div
          className={`truncate text-base font-bold ${
            group.allDone ? "text-[var(--text-muted)] line-through" : ""
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
          ariaLabel={
            group.allDone ? "Desmarcar grupo" : "Marcar grupo completo"
          }
        />
      ) : null}
    </>
  );

  const Body = (
    <>
      <ul className="mt-3 divide-y divide-[var(--line)]">
        {group.exercises.map((exercise) => (
          <ExerciseRow key={exercise.id} exercise={exercise} />
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <NewExerciseForm dayId={group.id} />
        <details className="relative">
          <summary className="list-none cursor-pointer text-xs text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
            editar grupo
          </summary>
          <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
            <form action={updateWorkoutDay} className="space-y-2">
              <input type="hidden" name="dayId" value={group.id} />
              <input
                name="title"
                defaultValue={group.title}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <select
                name="weekDay"
                defaultValue={String(group.weekDay)}
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              >
                {WEEK_DAY_SHORT.map((label, idx) => (
                  <option key={label} value={idx}>
                    {label}
                  </option>
                ))}
              </select>
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
    </>
  );

  if (primary) {
    return (
      <div className="rounded-2xl bg-[var(--bg)] px-4 py-3">
        <div className={headerWrap}>{Header}</div>
        {Body}
      </div>
    );
  }

  return (
    <details className="rounded-2xl bg-[var(--bg)] px-4 py-3">
      <summary className={headerWrap}>{Header}</summary>
      {Body}
    </details>
  );
}

function ExerciseRow({ exercise }: { exercise: TreinosExercise }) {
  const meta = [
    exercise.sets ? `${exercise.sets}x` : null,
    exercise.reps,
    exercise.load,
  ]
    .filter(Boolean)
    .join(" • ");

  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <div className="min-w-0 flex-1">
        <div
          className={`truncate text-base ${
            exercise.completed
              ? "text-[var(--text-muted)] line-through"
              : "text-[var(--text)]"
          }`}
        >
          {exercise.name}
        </div>
        {meta ? (
          <div className="truncate text-xs text-[var(--text-muted)]">
            {meta}
          </div>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <details className="relative">
          <summary className="list-none cursor-pointer text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
            <form action={updateWorkoutExercise} className="space-y-2">
              <input type="hidden" name="exerciseId" value={exercise.id} />
              <input
                name="name"
                defaultValue={exercise.name}
                placeholder="Exercicio"
                required
                className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                <input
                  name="sets"
                  defaultValue={exercise.sets ?? ""}
                  placeholder="Series"
                  type="number"
                  min={1}
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                />
                <input
                  name="reps"
                  defaultValue={exercise.reps ?? ""}
                  placeholder="Reps"
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                />
                <input
                  name="load"
                  defaultValue={exercise.load ?? ""}
                  placeholder="Carga"
                  className="rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
              >
                Salvar
              </button>
            </form>
            <form action={deleteWorkoutExercise} className="mt-2">
              <input type="hidden" name="exerciseId" value={exercise.id} />
              <button
                type="submit"
                className="w-full rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
              >
                Excluir
              </button>
            </form>
          </div>
        </details>
        <CheckButton
          action={toggleWorkoutExerciseForToday}
          hiddenFields={{ exerciseId: exercise.id }}
          checked={exercise.completed}
          ariaLabel={
            exercise.completed ? "Desmarcar exercicio" : "Marcar exercicio"
          }
        />
      </div>
    </li>
  );
}

function NewExerciseForm({ dayId }: { dayId: string }) {
  return (
    <details className="flex-1 min-w-[200px]">
      <summary className="list-none cursor-pointer text-xs font-semibold text-[var(--text-soft)] [&::-webkit-details-marker]:hidden">
        + adicionar exercicio
      </summary>
      <form action={createWorkoutExercise} className="mt-2 space-y-2">
        <input type="hidden" name="dayId" value={dayId} />
        <input
          name="name"
          placeholder="Nome do exercicio"
          required
          className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="sets"
            placeholder="Series"
            type="number"
            min={1}
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            name="reps"
            placeholder="Reps"
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
          />
          <input
            name="load"
            placeholder="Carga"
            className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm outline-none"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
        >
          Adicionar
        </button>
      </form>
    </details>
  );
}

function MiniDashboard({
  todayPct,
  todayDone,
  todayTotal,
  weekDaysCompleted,
  weekDaysPlanned,
  monthTrainedDays,
  last7,
}: {
  todayPct: number;
  todayDone: number;
  todayTotal: number;
  weekDaysCompleted: number;
  weekDaysPlanned: number;
  monthTrainedDays: number;
  last7: Array<{ date: string; weekDay: number; count: number; trained: boolean }>;
}) {
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
          mes
        </div>
        <div className="mt-1 text-base font-bold">{monthTrainedDays}</div>
        <div className="mt-1 text-[10px] text-[var(--text-muted)]">
          dias no mes
        </div>
      </div>
      <div className="col-span-3">
        <div className="text-[var(--text-muted)] uppercase tracking-wider">
          ultimos 7 dias
        </div>
        <div className="mt-2 flex items-end justify-between gap-1">
          {last7.map((d, i) => {
            const max = Math.max(1, ...last7.map((x) => x.count));
            const h = d.count > 0 ? Math.round((d.count / max) * 22) + 4 : 3;
            return (
              <div key={d.date + i} className="flex flex-col items-center gap-1">
                <div
                  className={`w-3 rounded-sm ${
                    d.trained ? "bg-[var(--text)]" : "bg-[var(--check)]/60"
                  }`}
                  style={{ height: `${h}px` }}
                  title={`${d.date}: ${d.count} concluidos`}
                />
                <span className="text-[9px] text-[var(--text-muted)]">
                  {WEEK_DAY_SHORT[d.weekDay][0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
