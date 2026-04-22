import { ModulePage } from "@/components/module-page";
import { addWaterLog, deleteWaterLog } from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function HidratacaoPage() {
  const data = await getModuleData("hidratacao");
  return (
    <ModulePage
      slug="hidratacao"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Excluir",
            action: deleteWaterLog,
            hiddenFields: { logId: record.id },
            tone: "danger",
          },
        ],
      }))}
      createCard={{
        title: "Registrar agua",
        description: "Salva o consumo em ml no historico do dia.",
        action: addWaterLog,
        fields: [{ name: "amountMl", placeholder: "Quantidade em ml", type: "number" }],
        submitLabel: "Registrar",
      }}
    />
  );
}
