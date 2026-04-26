import { Pill } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import {
  createMedication,
  deleteMedication,
  updateMedication,
} from "@/server/actions";
import { getRemediosData } from "@/server/app-data";

export default async function RemediosPage() {
  const items = await getRemediosData();
  return (
    <PageShell icon={Pill}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Remedios{" "}
          <span className="font-normal text-[var(--text-soft)]">ativos</span>
        </h1>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {items.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              Nenhum remedio cadastrado.
            </p>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                title={item.name}
                subtitle={`${item.schedules} horarios • ${item.frequency}`}
                edit={{
                  action: updateMedication,
                  hiddenFields: { medicationId: item.id },
                  fields: [{ name: "name", defaultValue: item.name }],
                }}
                remove={{
                  action: deleteMedication,
                  hiddenFields: { medicationId: item.id },
                }}
              />
            ))
          )}
        </div>

        <div className="mt-8">
          <InlineAdd
            action={createMedication}
            fields={[{ name: "name", placeholder: "Ex.: Vitamina D" }]}
            label="Novo remedio"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}
