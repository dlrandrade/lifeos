import { Database, Layers3, ScrollText } from "lucide-react";
import { modulePreview, modules } from "@/lib/modules";
import { CreateCard } from "@/components/create-card";
import { RecordListCard } from "@/components/record-list-card";

type ModuleSlug = Exclude<(typeof modules)[number]["slug"], "dashboard">;

type ModulePageProps = {
  slug: ModuleSlug;
  countLabel?: string;
  records?: Array<{
    id: string;
    title: string;
    subtitle: string;
    actions?: Array<{
      label: string;
      action: (formData: FormData) => Promise<void>;
      hiddenFields?: Record<string, string | undefined>;
      tone?: "default" | "danger" | "dark";
    }>;
  }>;
  extraSections?: Array<{
    id: string;
    title: string;
    subtitle?: string;
    records: Array<{
      id: string;
      title: string;
      subtitle?: string;
      actions?: Array<{
        label: string;
        action: (formData: FormData) => Promise<void>;
        hiddenFields?: Record<string, string | undefined>;
        tone?: "default" | "danger" | "dark";
      }>;
    }>;
  }>;
  createCard?: {
    title: string;
    description: string;
    action: (formData: FormData) => Promise<void>;
    hiddenFields?: Record<string, string>;
    fields: Array<{
      name: string;
      placeholder: string;
      type?: "text" | "datetime-local" | "number";
      required?: boolean;
    }>;
    submitLabel: string;
  };
  secondaryCards?: React.ReactNode;
};

export function ModulePage({
  slug,
  records = [],
  extraSections = [],
  createCard,
  secondaryCards,
}: ModulePageProps) {
  const moduleInfo = modules.find((item) => item.slug === slug);
  const preview = modulePreview[slug];

  if (!moduleInfo) {
    return null;
  }
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="space-y-6">
        <RecordListCard
          eyebrow={preview.eyebrow}
          title={moduleInfo.label}
          emptyLabel={preview.items[0] ?? "Nenhum registro ainda."}
          records={
            records.length
              ? records
              : preview.items.map((item, index) => ({
                  id: `${slug}-${index}`,
                  title: item,
                  subtitle: "",
                }))
          }
        />
        {extraSections.map((section) => (
          <RecordListCard
            key={section.id}
            eyebrow={section.subtitle}
            title={section.title}
            emptyLabel="Nenhum item cadastrado."
            records={section.records}
          />
        ))}
      </section>

      <aside className="space-y-4">
        {createCard ? <CreateCard {...createCard} /> : null}
        {secondaryCards}
        <article className="rounded-[1.8rem] bg-[#161616] p-5 text-[#f7f2eb]">
          <p className="text-xs uppercase tracking-[0.22em] text-white/50">
            Persistencia prevista
          </p>
          <div className="mt-5 space-y-4 text-sm leading-6 text-white/72">
            <div className="flex gap-3">
              <Database className="mt-1 h-4 w-4 shrink-0" />
              <p>
                Entidade principal do modulo armazenada em tabela base com relacao ao usuario.
              </p>
            </div>
            <div className="flex gap-3">
              <Layers3 className="mt-1 h-4 w-4 shrink-0" />
              <p>Dados operacionais salvos em logs para preservar historico por data.</p>
            </div>
            <div className="flex gap-3">
              <ScrollText className="mt-1 h-4 w-4 shrink-0" />
              <p>Estrutura pronta para CRUD, filtros e indicadores no dashboard.</p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.8rem] bg-[#ebe4d8] p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-muted">Prisma</p>
          <h3 className="headline mt-3 text-3xl leading-none">schema modelado</h3>
          <p className="mt-4 text-sm leading-6 text-muted">
            O schema inicial ja contem o modelo relacional para este modulo em
            `prisma/schema.prisma`.
          </p>
        </article>
      </aside>
    </div>
  );
}
