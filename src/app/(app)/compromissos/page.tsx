import { ModulePage } from "@/components/module-page";
import {
  createAppointment,
  deleteAppointment,
  updateAppointmentStatus,
} from "@/server/actions";
import { getModuleData } from "@/server/app-data";

export default async function CompromissosPage() {
  const data = await getModuleData("compromissos");
  return (
    <ModulePage
      slug="compromissos"
      countLabel={data.countLabel}
      records={data.records.map((record) => ({
        ...record,
        actions: [
          {
            label: "Concluir",
            action: updateAppointmentStatus,
            hiddenFields: { appointmentId: record.id, status: "DONE" } as Record<string, string>,
            tone: "dark" as const,
          },
          {
            label: "Cancelar",
            action: updateAppointmentStatus,
            hiddenFields: { appointmentId: record.id, status: "CANCELED" } as Record<string, string>,
          },
          {
            label: "Excluir",
            action: deleteAppointment,
            hiddenFields: { appointmentId: record.id } as Record<string, string>,
            tone: "danger" as const,
          },
        ],
      }))}
      createCard={{
        title: "Novo compromisso",
        description: "Cria um evento simples com data e hora.",
        action: createAppointment,
        fields: [
          { name: "title", placeholder: "Titulo do compromisso" },
          { name: "startsAt", placeholder: "Data e hora", type: "datetime-local" },
        ],
        submitLabel: "Salvar compromisso",
      }}
    />
  );
}
