import { Pencil, Trash2 } from "lucide-react";
import { CheckButton } from "@/components/check-button";

type Field = {
  name: string;
  defaultValue?: string;
  placeholder?: string;
  type?: "text" | "datetime-local" | "number";
  required?: boolean;
};

export type ItemRowProps = {
  title: string;
  subtitle?: string | null;
  faded?: boolean;
  bold?: boolean;
  toggle?: {
    action: (formData: FormData) => Promise<void>;
    hiddenFields: Record<string, string>;
    checked: boolean;
  };
  edit?: {
    action: (formData: FormData) => Promise<void>;
    hiddenFields: Record<string, string>;
    fields: Field[];
    submitLabel?: string;
  };
  remove?: {
    action: (formData: FormData) => Promise<void>;
    hiddenFields: Record<string, string>;
  };
};

export function ItemRow({
  title,
  subtitle,
  faded,
  bold,
  toggle,
  edit,
  remove,
}: ItemRowProps) {
  const titleClass = `truncate text-base ${
    faded ? "text-[var(--text-muted)]" : "text-[var(--text)]"
  } ${bold ? "font-bold" : ""}`;
  const subtitleClass = `truncate text-sm ${
    faded ? "text-[var(--text-muted)]" : "text-[var(--text-soft)]"
  }`;

  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0 flex-1">
        <div className={titleClass}>{title}</div>
        {subtitle ? <div className={subtitleClass}>{subtitle}</div> : null}
      </div>
      <div className="flex items-center gap-2">
        {edit ? (
          <details className="relative">
            <summary
              aria-label="Editar"
              className="list-none cursor-pointer text-[var(--text-muted)] [&::-webkit-details-marker]:hidden"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.7} />
            </summary>
            <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
              <form action={edit.action} className="space-y-2">
                {Object.entries(edit.hiddenFields).map(([k, v]) => (
                  <input key={k} type="hidden" name={k} value={v} />
                ))}
                {edit.fields.map((field) => (
                  <input
                    key={field.name}
                    name={field.name}
                    type={field.type ?? "text"}
                    defaultValue={field.defaultValue}
                    placeholder={field.placeholder}
                    required={field.required ?? true}
                    className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
                  />
                ))}
                <button
                  type="submit"
                  className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
                >
                  {edit.submitLabel ?? "Salvar"}
                </button>
              </form>
            </div>
          </details>
        ) : null}
        {remove ? (
          <form action={remove.action}>
            {Object.entries(remove.hiddenFields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={v} />
            ))}
            <button
              type="submit"
              aria-label="Excluir"
              className="text-[var(--text-muted)] hover:text-red-600 transition"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.7} />
            </button>
          </form>
        ) : null}
        {toggle ? (
          <CheckButton
            action={toggle.action}
            hiddenFields={toggle.hiddenFields}
            checked={toggle.checked}
          />
        ) : null}
      </div>
    </div>
  );
}
