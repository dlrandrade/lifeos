import { CalendarDays } from "lucide-react";
import { PageShell, InnerCard } from "@/components/page-shell";
import { ItemRow } from "@/components/item-row";
import { InlineAdd } from "@/components/inline-add";
import {
  createAppointment,
  deleteAppointment,
  updateAppointment,
  updateAppointmentStatus,
} from "@/server/actions";
import { getCompromissosData } from "@/server/app-data";

function isoForInput(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default async function CompromissosPage() {
  const items = await getCompromissosData();

  return (
    <PageShell icon={CalendarDays}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Compromissos{" "}
          <span className="font-normal text-[var(--text-soft)]">
            {new Date().getFullYear()}
          </span>
        </h1>

        <div className="mt-8 divide-y divide-[var(--line)]">
          {items.length === 0 ? (
            <p className="py-4 text-sm text-[var(--text-muted)]">
              Sem compromissos cadastrados.
            </p>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                title={item.title}
                subtitle={`${item.startsAt.toLocaleDateString(
                  "pt-BR",
                )} ${item.startsAt.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} • ${item.status}`}
                faded={item.status !== "SCHEDULED"}
                toggle={{
                  action: updateAppointmentStatus,
                  hiddenFields: {
                    appointmentId: item.id,
                    status: item.status === "DONE" ? "SCHEDULED" : "DONE",
                  },
                  checked: item.status === "DONE",
                }}
                edit={{
                  action: updateAppointment,
                  hiddenFields: { appointmentId: item.id },
                  fields: [
                    { name: "title", defaultValue: item.title },
                    {
                      name: "startsAt",
                      defaultValue: isoForInput(item.startsAt),
                      type: "datetime-local",
                      required: false,
                    },
                  ],
                }}
                remove={{
                  action: deleteAppointment,
                  hiddenFields: { appointmentId: item.id },
                }}
              />
            ))
          )}
        </div>

        <div className="mt-8">
          <InlineAdd
            action={createAppointment}
            fields={[
              { name: "title", placeholder: "Titulo" },
              {
                name: "startsAt",
                placeholder: "Data e hora",
                type: "datetime-local",
              },
            ]}
            label="Novo compromisso"
          />
        </div>
      </InnerCard>
    </PageShell>
  );
}
