import { ActionFormButton } from "@/components/action-form-button";

type RecordItem = {
  id: string;
  title: string;
  subtitle?: string;
  actions?: Array<{
    label: string;
    action: (formData: FormData) => Promise<void>;
    hiddenFields?: Record<string, string | undefined>;
    tone?: "default" | "danger" | "dark";
  }>;
};

type RecordListCardProps = {
  title: string;
  eyebrow?: string;
  emptyLabel: string;
  records: RecordItem[];
};

export function RecordListCard({
  title,
  eyebrow,
  emptyLabel,
  records,
}: RecordListCardProps) {
  return (
    <article className="rounded-[2rem] bg-white p-6 sm:p-8">
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
      ) : null}
      <h2 className="headline mt-3 text-5xl leading-[0.92]">{title}</h2>

      <div className="mt-8 grid gap-3">
        {records.length ? (
          records.map((record) => (
            <div
              key={record.id}
              className="rounded-[1.2rem] bg-[#f5f1ea] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold sm:text-base">{record.title}</p>
                  {record.subtitle ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted">
                      {record.subtitle}
                    </p>
                  ) : null}
                </div>
                {record.actions?.length ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {record.actions.map((action, index) => (
                      <ActionFormButton
                        key={`${record.id}-${action.label}-${index}`}
                        action={action.action}
                        hiddenFields={action.hiddenFields}
                        label={action.label}
                        tone={action.tone}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[1.2rem] bg-[#f5f1ea] px-4 py-4 text-sm text-muted">
            {emptyLabel}
          </div>
        )}
      </div>
    </article>
  );
}
