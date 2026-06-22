import { Droplets, Trash2 } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { EmptyState } from "@/components/empty-state";
import { addWaterLog, deleteWaterLog } from "@/server/actions";
import { getHidratacaoData } from "@/server/app-data";

const QUICK_AMOUNTS = [200, 300, 500];

export default async function HidratacaoPage() {
  const data = await getHidratacaoData();
  const pct = Math.min(100, Math.round((data.total / data.goal) * 100));

  return (
    <PageShell icon={Droplets}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Hidratacao{" "}
          <span className="font-normal text-[var(--text-soft)]">hoje</span>
        </h1>

        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">{data.total}</span>
            <span className="text-base text-[var(--text-soft)]">
              / {data.goal} ml
            </span>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-[var(--bg)]">
            <div
              className="h-full rounded-full bg-[var(--text)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{pct}% da meta</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <form action={addWaterLog} key={amount}>
              <input type="hidden" name="amountMl" value={amount} />
              <button
                type="submit"
                className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-sm font-semibold text-white"
              >
                +{amount}ml
              </button>
            </form>
          ))}
        </div>

        <form action={addWaterLog} className="mt-3 flex gap-2">
          <input
            name="amountMl"
            type="number"
            min={1}
            placeholder="Outra quantidade (ml)"
            required
            className="flex-1 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-[var(--text)] px-4 py-2 text-sm font-semibold text-white"
          >
            Registrar
          </button>
        </form>

        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
            Registros de hoje
          </h2>
          <div className="mt-3 divide-y divide-[var(--line)]">
            {data.logs.length === 0 ? (
              <EmptyState
                icon={Droplets}
                title="Nenhum registro hoje"
                hint="Toque em +200ml para comecar."
              />
            ) : (
              data.logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between py-2"
                >
                  <div>
                    <div className="text-base font-bold">{log.amountMl}ml</div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {log.occurredAt.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <form action={deleteWaterLog}>
                    <input type="hidden" name="logId" value={log.id} />
                    <button
                      type="submit"
                      aria-label="Excluir registro"
                      className="text-[var(--text-muted)] hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                    </button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </InnerCard>
    </PageShell>
  );
}
