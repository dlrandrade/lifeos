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

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default async function CompromissosPage() {
  const items = await getCompromissosData();

  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const inSeven = new Date(today);
  inSeven.setDate(inSeven.getDate() + 7);

  const todayItems = items.filter(
    (i) => i.startsAt >= today && i.startsAt < tomorrow,
  );
  const weekItems = items.filter(
    (i) => i.startsAt >= tomorrow && i.startsAt < inSeven,
  );
  const upcoming = items.filter((i) => i.startsAt >= inSeven);
  const past = items.filter((i) => i.startsAt < today);

  return (
    <PageShell icon={CalendarDays}>
      <InnerCard>
        <h1 className="text-3xl font-bold tracking-tight">
          Compromissos{" "}
          <span className="font-normal text-[var(--text-soft)]">
            {new Date().getFullYear()}
          </span>
        </h1>

        {items.length === 0 ? (
          <p className="mt-8 text-sm text-[var(--text-muted)]">
            Sem compromissos cadastrados.
          </p>
        ) : null}

        <Group title="Hoje" items={todayItems} />
        <Group title="Esta semana" items={weekItems} />
        <Group title="Proximos" items={upcoming} />

        {past.length ? (
          <details className="mt-8">
            <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-[var(--text-muted)] [&::-webkit-details-marker]:hidden">
              Passados ({past.length})
            </summary>
            <div className="mt-3 divide-y divide-[var(--line)]">
              {past.map((item) => (
                <Row key={item.id} item={item} />
              ))}
            </div>
          </details>
        ) : null}

        <div className="mt-10">
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

function Group({
  title,
  items,
}: {
  title: string;
  items: Array<{ id: string; title: string; startsAt: Date; status: string }>;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-8">
      <h2 className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {title}
      </h2>
      <div className="mt-2 divide-y divide-[var(--line)]">
        {items.map((item) => (
          <Row key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function Row({
  item,
}: {
  item: { id: string; title: string; startsAt: Date; status: string };
}) {
  return (
    <ItemRow
      title={item.title}
      subtitle={`${item.startsAt.toLocaleDateString(
        "pt-BR",
      )} ${item.startsAt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`}
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
  );
}
