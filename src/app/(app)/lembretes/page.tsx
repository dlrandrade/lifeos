import { Bell } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import {
  createReminder,
  deleteReminder,
  updateReminder,
  updateReminderStatus,
} from "@/server/actions";
import { getLembretesData } from "@/server/app-data";

const PRIORITY_LABEL: Record<string, string> = {
  HIGH: "Alta prioridade",
  MEDIUM: "Media",
  LOW: "Baixa",
};

export default async function LembretesPage() {
  const items = await getLembretesData();

  const pending = items.filter((i) => i.status === "PENDING");
  const done = items.filter((i) => i.status === "DONE");
  const cancelled = items.filter((i) => i.status === "CANCELED");

  const groups = (["HIGH", "MEDIUM", "LOW"] as const)
    .map((p) => ({
      key: p,
      label: PRIORITY_LABEL[p],
      list: pending.filter((i) => i.priority === p),
    }))
    .filter((g) => g.list.length > 0);

  return (
    <PageShell icon={Bell}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Lembretes{" "}
          <span className="font-normal text-[var(--text-soft)]">
            pendencias
          </span>
        </h1>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--text-muted)]">
            Sem lembretes.
          </p>
        ) : null}

        {groups.map((group) => (
          <section key={group.key} className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {group.label}
            </h2>
            <div className="mt-2 divide-y divide-[var(--line)]">
              {group.list.map((item) => (
                <ReminderRow key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))}

        {done.length || cancelled.length ? (
          <details className="mt-8">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
              Arquivados ({done.length + cancelled.length})
            </summary>
            <div className="mt-3 divide-y divide-[var(--line)]">
              {[...done, ...cancelled].map((item) => (
                <ReminderRow key={item.id} item={item} />
              ))}
            </div>
          </details>
        ) : null}

        <div className="mt-10">
          <InlineAdd
            action={createReminder}
            fields={[{ name: "title", placeholder: "Ex.: Pagar carro" }]}
            label="Novo lembrete"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}

function ReminderRow({
  item,
}: {
  item: {
    id: string;
    title: string;
    priority: string;
    status: string;
  };
}) {
  return (
    <ItemRow
      title={item.title}
      subtitle={item.priority}
      faded={item.status !== "PENDING"}
      toggle={{
        action: updateReminderStatus,
        hiddenFields: {
          reminderId: item.id,
          status: item.status === "DONE" ? "PENDING" : "DONE",
        },
        checked: item.status === "DONE",
      }}
      edit={{
        action: updateReminder,
        hiddenFields: { reminderId: item.id },
        fields: [{ name: "title", defaultValue: item.title }],
      }}
      remove={{
        action: deleteReminder,
        hiddenFields: { reminderId: item.id },
      }}
    />
  );
}
