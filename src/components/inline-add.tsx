import { Plus } from "lucide-react";

type Field = {
  name: string;
  placeholder: string;
  type?: "text" | "datetime-local" | "number";
  required?: boolean;
};

type InlineAddProps = {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;
  fields: Field[];
  label?: string;
  variant?: "ghost" | "fab";
};

export function InlineAdd({
  action,
  hiddenFields,
  fields,
  label = "Adicionar",
  variant = "ghost",
}: InlineAddProps) {
  if (variant === "fab") {
    return (
      <details className="relative">
        <summary
          aria-label={label}
          className="list-none cursor-pointer flex h-10 w-10 items-center justify-center rounded-full bg-[var(--text)] text-white shadow-md [&::-webkit-details-marker]:hidden"
        >
          <Plus className="h-5 w-5" />
        </summary>
        <div className="absolute right-0 bottom-12 w-64 rounded-2xl bg-white p-3 shadow-lg ring-1 ring-black/5 z-10">
          <Form action={action} hiddenFields={hiddenFields} fields={fields} label={label} />
        </div>
      </details>
    );
  }

  return (
    <details className="group">
      <summary className="list-none cursor-pointer flex items-center gap-3 py-2 text-[var(--text-muted)] hover:text-[var(--text)] transition [&::-webkit-details-marker]:hidden">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--check)] text-white">
          <Plus className="h-4 w-4" strokeWidth={3} />
        </span>
        <span className="text-base">{label}</span>
      </summary>
      <div className="mt-2">
        <Form action={action} hiddenFields={hiddenFields} fields={fields} label={label} />
      </div>
    </details>
  );
}

function Form({
  action,
  hiddenFields,
  fields,
  label,
}: {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string>;
  fields: Field[];
  label: string;
}) {
  return (
    <form action={action} className="space-y-2">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))
        : null}
      {fields.map((field) => (
        <input
          key={field.name}
          name={field.name}
          type={field.type ?? "text"}
          placeholder={field.placeholder}
          required={field.required ?? true}
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
        />
      ))}
      <button
        type="submit"
        className="w-full rounded-full bg-[var(--text)] px-3 py-2 text-xs font-semibold text-white"
      >
        {label}
      </button>
    </form>
  );
}
