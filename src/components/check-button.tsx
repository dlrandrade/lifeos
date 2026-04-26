import { Check } from "lucide-react";

type CheckButtonProps = {
  action: (formData: FormData) => Promise<void>;
  hiddenFields?: Record<string, string | undefined>;
  checked: boolean;
  ariaLabel?: string;
};

export function CheckButton({
  action,
  hiddenFields,
  checked,
  ariaLabel = "Marcar concluido",
}: CheckButtonProps) {
  return (
    <form action={action}>
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value ?? ""} />
          ))
        : null}
      <button
        type="submit"
        aria-label={ariaLabel}
        aria-pressed={checked}
        className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
          checked
            ? "bg-[var(--check-active)] text-white"
            : "bg-[var(--check)] text-transparent hover:bg-[var(--check-active)] hover:text-white"
        }`}
      >
        <Check className="h-4 w-4" strokeWidth={3} />
      </button>
    </form>
  );
}
