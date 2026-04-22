import { ModulePage } from "@/components/module-page";
import { CreateCard } from "@/components/create-card";
import {
  createMealItem,
  createMealPlan,
  createMealSection,
  deleteMealItem,
  deleteMealPlan,
  deleteMealSection,
} from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function DietaPage() {
  const data = await getModuleData("dieta");
  return (
    <ModulePage
      slug="dieta"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Excluir refeicao",
            action: deleteMealSection,
            hiddenFields: { sectionId: record.id },
            tone: "danger",
          },
        ],
      }))}
      extraSections={
        "sections" in data && data.sections
          ? data.sections.map((section) => ({
              id: section.id,
              title: section.title,
              subtitle: section.subtitle,
              records: section.items.map((item) => ({
                id: item.id,
                title: item.title,
                subtitle: item.subtitle,
                actions: [
                  {
                    label: "Excluir item",
                    action: deleteMealItem,
                    hiddenFields: { itemId: item.id },
                    tone: "danger",
                  },
                ],
              })),
            }))
          : []
      }
      createCard={{
        title: "Novo plano alimentar",
        description: "Cria a estrutura base da dieta ativa.",
        action: createMealPlan,
        fields: [{ name: "name", placeholder: "Ex.: Dieta Abril" }],
        submitLabel: "Salvar plano",
      }}
      secondaryCards={
        <>
          {"planId" in data && data.planId ? (
            <>
              <CreateCard
                title="Nova refeicao"
                description="Adiciona uma refeicao ao plano ativo."
                action={createMealSection}
                hiddenFields={{ planId: data.planId }}
                fields={[{ name: "title", placeholder: "Ex.: Cafe da manha" }]}
                submitLabel="Salvar refeicao"
              />
              {("sections" in data ? data.sections : []).map((section) => (
                <CreateCard
                  key={section.id}
                  title="Novo item"
                  description={`Adicionar item em ${section.title}.`}
                  action={createMealItem}
                  hiddenFields={{ sectionId: section.id }}
                  fields={[{ name: "description", placeholder: "Ex.: 3 ovos" }]}
                  submitLabel="Salvar item"
                />
              ))}
              <CreateCard
                title="Excluir plano"
                description="Remove o plano alimentar ativo."
                action={deleteMealPlan}
                hiddenFields={{ planId: data.planId }}
                fields={[]}
                submitLabel="Excluir plano"
              />
            </>
          ) : null}
        </>
      }
    />
  );
}
