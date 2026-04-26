import { Utensils } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { CheckButton } from "@/components/check-button";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import {
  createMealItem,
  createMealPlan,
  createMealSection,
  deleteMealItem,
  deleteMealPlan,
  deleteMealSection,
  toggleMealForToday,
  updateMealItem,
  updateMealPlan,
  updateMealSection,
} from "@/server/actions";
import { getDietaData } from "@/server/app-data";

export default async function DietaPage() {
  const data = await getDietaData();

  if (!data.plan) {
    return (
      <PageShell icon={Utensils}>
        <InnerCard>
          <h1 className="text-3xl font-bold tracking-tight">Dieta</h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Crie um plano alimentar para comecar.
          </p>
          <div className="mt-6">
            <InlineAdd
              action={createMealPlan}
              fields={[{ name: "name", placeholder: "Ex.: Dieta Abril" }]}
              label="Novo plano"
            />
          </div>
        </InnerCard>
      </PageShell>
    );
  }

  return (
    <PageShell icon={Utensils}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Dieta{" "}
          <span className="font-normal text-[var(--text-soft)]">
            {data.monthLabel}
          </span>
        </h1>

        <div className="mt-8 space-y-7">
          {data.sections.map((section) => (
            <div key={section.id}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">{section.title}</h2>
                <div className="flex items-center gap-2">
                  <details className="relative">
                    <summary className="list-none cursor-pointer text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
                      <span className="text-xs uppercase tracking-[0.18em]">editar</span>
                    </summary>
                    <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
                      <form action={updateMealSection} className="space-y-2">
                        <input type="hidden" name="sectionId" value={section.id} />
                        <input
                          name="title"
                          defaultValue={section.title}
                          required
                          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                        />
                        <button
                          type="submit"
                          className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
                        >
                          Salvar
                        </button>
                      </form>
                      <form action={deleteMealSection} className="mt-2">
                        <input type="hidden" name="sectionId" value={section.id} />
                        <button
                          type="submit"
                          className="w-full rounded-full border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
                        >
                          Excluir refeicao
                        </button>
                      </form>
                    </div>
                  </details>
                  <CheckButton
                    action={toggleMealForToday}
                    hiddenFields={{ sectionId: section.id }}
                    checked={section.completedToday}
                    ariaLabel={
                      section.completedToday
                        ? "Desmarcar refeicao"
                        : "Concluir refeicao"
                    }
                  />
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {section.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    title={item.description}
                    edit={{
                      action: updateMealItem,
                      hiddenFields: { itemId: item.id },
                      fields: [
                        { name: "description", defaultValue: item.description },
                      ],
                    }}
                    remove={{
                      action: deleteMealItem,
                      hiddenFields: { itemId: item.id },
                    }}
                  />
                ))}
                <div className="pt-1">
                  <InlineAdd
                    action={createMealItem}
                    hiddenFields={{ sectionId: section.id }}
                    fields={[
                      { name: "description", placeholder: "Ex.: 3 ovos" },
                    ]}
                    label="Adicionar item"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 space-y-3">
          <InlineAdd
            action={createMealSection}
            hiddenFields={{ planId: data.plan.id }}
            fields={[{ name: "title", placeholder: "Ex.: Cafe da manha" }]}
            label="Nova refeicao"
          />
          <details>
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
              {data.plan.name} • editar plano
            </summary>
            <div className="mt-2 space-y-2">
              <form action={updateMealPlan} className="flex gap-2">
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
              <form action={deleteMealPlan}>
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
        </div>
      </InnerCard>
    </PageShell>
  );
}
