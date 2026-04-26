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

export default async function LembretesPage() {
  const items = await getLembretesData();

  return (
    <PageShell icon={Bell}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Lembretes{" "}
          <span className="font-normal text-[var(--text-soft)]">
            pendencias
          </span>
        </h1>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {items.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              Sem lembretes.
            </p>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
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
            ))
          )}
        </div>

        <div className="mt-8">
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
