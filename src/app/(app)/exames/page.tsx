import { TestTubeDiagonal } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import { createExam, deleteExam, updateExam } from "@/server/actions";
import { getExamesData } from "@/server/app-data";

export default async function ExamesPage() {
  const items = await getExamesData();
  return (
    <PageShell icon={TestTubeDiagonal}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Exames{" "}
          <span className="font-normal text-[var(--text-soft)]">historico</span>
        </h1>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {items.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              Nenhum exame registrado.
            </p>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                title={item.name}
                subtitle={`${item.status} • ${item.category ?? "Geral"}`}
                edit={{
                  action: updateExam,
                  hiddenFields: { examId: item.id },
                  fields: [{ name: "name", defaultValue: item.name }],
                }}
                remove={{
                  action: deleteExam,
                  hiddenFields: { examId: item.id },
                }}
              />
            ))
          )}
        </div>

        <div className="mt-8">
          <InlineAdd
            action={createExam}
            fields={[{ name: "name", placeholder: "Ex.: Hemograma" }]}
            label="Novo exame"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}
