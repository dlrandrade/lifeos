import { ModulePage } from "@/components/module-page";
import { createExam } from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function ExamesPage() {
  const data = await getModuleData("exames");
  return (
    <ModulePage
      slug="exames"
      countLabel={data.countLabel}
      records={data.records}
      createCard={{
        title: "Novo exame",
        description: "Cria o registro base para acompanhamento e anexos futuros.",
        action: createExam,
        fields: [{ name: "name", placeholder: "Nome do exame" }],
        submitLabel: "Salvar exame",
      }}
    />
  );
}
