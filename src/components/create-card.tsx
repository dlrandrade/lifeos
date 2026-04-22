type CreateCardProps = {
  title: string;
  description: string;
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string | undefined>;
  fields: Array<{
    name: string;
    placeholder: string;
    type?: "text" | "datetime-local" | "number";
    required?: boolean;
  }>;
  submitLabel: string;
};

export function CreateCard({
  title,
  description,
  action,
  hiddenFields,
  fields,
  submitLabel,
}: CreateCardProps) {
  return (
    <form action={action} className="rounded-[1.8rem] bg-white p-5">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <p className="text-xs uppercase tracking-[0.22em] text-muted">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-5 space-y-3">
        {fields.map((field) => (
          <input
            key={field.name}
            name={field.name}
            type={field.type ?? "text"}
            placeholder={field.placeholder}
            className="w-full rounded-2xl border border-line bg-[#f7f3ed] px-4 py-3 text-sm outline-none"
            required={field.required ?? true}
          />
        ))}
      </div>
      <button
        type="submit"
        className="mt-4 rounded-full bg-[#161616] px-5 py-3 text-sm font-semibold text-[#f8f3eb]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
