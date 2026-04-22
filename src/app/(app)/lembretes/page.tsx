import { ModulePage } from "@/components/module-page";
import { createReminder, deleteReminder, updateReminderStatus } from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function LembretesPage() {
  const data = await getModuleData("lembretes");
  return (
    <ModulePage
      slug="lembretes"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Concluir",
            action: updateReminderStatus,
            hiddenFields: { reminderId: record.id, status: "DONE" },
            tone: "dark",
          },
          {
            label: "Cancelar",
            action: updateReminderStatus,
            hiddenFields: { reminderId: record.id, status: "CANCELED" },
          },
          {
            label: "Excluir",
            action: deleteReminder,
            hiddenFields: { reminderId: record.id },
            tone: "danger",
          },
        ],
      }))}
      createCard={{
        title: "Novo lembrete",
        description: "Registra uma pendencia simples para acompanhamento.",
        action: createReminder,
        fields: [{ name: "title", placeholder: "Ex.: Comprar remedio" }],
        submitLabel: "Salvar lembrete",
      }}
    />
  );
}
