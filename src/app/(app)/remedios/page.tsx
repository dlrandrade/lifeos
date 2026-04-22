import { ModulePage } from "@/components/module-page";
import { createMedication } from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function RemediosPage() {
  const data = await getModuleData("remedios");
  return (
    <ModulePage
      slug="remedios"
      countLabel={data.countLabel}
      records={data.records}
      createCard={{
        title: "Novo remedio",
        description: "Cria um cadastro base para depois definir horarios e dosagem.",
        action: createMedication,
        fields: [{ name: "name", placeholder: "Nome do remedio" }],
        submitLabel: "Salvar remedio",
      }}
    />
  );
}
