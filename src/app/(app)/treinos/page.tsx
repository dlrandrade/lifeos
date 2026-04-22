import { ModulePage } from "@/components/module-page";
import { CreateCard } from "@/components/create-card";
import {
  createWorkoutDay,
  createWorkoutExercise,
  createWorkoutPlan,
  deleteWorkoutDay,
  deleteWorkoutExercise,
  deleteWorkoutPlan,
} from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function TreinosPage() {
  const data = await getModuleData("treinos");
  return (
    <ModulePage
      slug="treinos"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Excluir dia",
            action: deleteWorkoutDay,
            hiddenFields: { dayId: record.id },
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
                    label: "Excluir exercicio",
                    action: deleteWorkoutExercise,
                    hiddenFields: { exerciseId: item.id },
                    tone: "danger",
                  },
                ],
              })),
            }))
          : []
      }
      createCard={{
        title: "Novo plano",
        description: "Cria um plano de treino base para depois receber dias e exercicios.",
        action: createWorkoutPlan,
        fields: [{ name: "name", placeholder: "Ex.: Hipertrofia Abril" }],
        submitLabel: "Salvar plano",
      }}
      secondaryCards={
        <>
          {"planId" in data && data.planId ? (
            <>
              <CreateCard
                title="Novo dia"
                description="Adiciona um dia ao plano ativo."
                action={createWorkoutDay}
                hiddenFields={{ planId: data.planId }}
                fields={[
                  { name: "title", placeholder: "Ex.: Peito e triceps" },
                  { name: "weekDay", placeholder: "0 a 6", type: "number" },
                ]}
                submitLabel="Salvar dia"
              />
              {("sections" in data ? data.sections : []).map((section) => (
                <CreateCard
                  key={section.id}
                  title={`Novo exercicio`}
                  description={`Adicionar exercicio em ${section.title}.`}
                  action={createWorkoutExercise}
                  hiddenFields={{ dayId: section.id }}
                  fields={[{ name: "name", placeholder: "Ex.: Supino reto" }]}
                  submitLabel="Salvar exercicio"
                />
              ))}
              <CreateCard
                title="Excluir plano"
                description="Remove o plano ativo e toda sua estrutura."
                action={deleteWorkoutPlan}
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
