type ActionFormButtonProps = {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string | undefined>;
  label: string;
  tone?: "default" | "danger" | "dark";
};

export function ActionFormButton({
  action,
  hiddenFields,
  label,
  tone = "default",
}: ActionFormButtonProps) {
  const className =
    tone === "danger"
      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
      : tone === "dark"
        ? "border-[#161616] bg-[#161616] text-[#f8f3eb] hover:bg-[#2a2a2a]"
        : "border-line bg-white/80 text-muted hover:bg-white";

  return (
    <form action={action}>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <button
        type="submit"
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${className}`}
      >
        {label}
      </button>
    </form>
  );
}
