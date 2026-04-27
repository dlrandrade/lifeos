import { TestTubeDiagonal } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import { createExam, deleteExam, updateExam } from "@/server/actions";
import { getExamesData } from "@/server/app-data";

const STATUS_LABEL: Record<string, string> = {
  PLANNED: "Planejados",
  SCHEDULED: "Agendados",
  DONE: "Realizados",
  REVIEWED: "Revisados",
};

export default async function ExamesPage() {
  const items = await getExamesData();

  const groups = (["SCHEDULED", "PLANNED", "DONE", "REVIEWED"] as const)
    .map((s) => ({
      key: s,
      label: STATUS_LABEL[s],
      list: items.filter((i) => i.status === s),
    }))
    .filter((g) => g.list.length > 0);

  return (
    <PageShell icon={TestTubeDiagonal}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Exames{" "}
          <span className="font-normal text-[var(--text-soft)]">historico</span>
        </h1>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--text-muted)]">
            Nenhum exame registrado.
          </p>
        ) : null}

        {groups.map((group) => (
          <section key={group.key} className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {group.label}
            </h2>
            <div className="mt-2 divide-y divide-[var(--line)]">
              {group.list.map((item) => (
                <ItemRow
                  key={item.id}
                  title={item.name}
                  subtitle={item.category ?? "Geral"}
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
              ))}
            </div>
          </section>
        ))}

        <div className="mt-10">
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
