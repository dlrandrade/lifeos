type AuthFormProps = {
  title: string;
  description: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
  includeName?: boolean;
};

export function AuthForm({
  title,
  description,
  action,
  submitLabel,
  includeName = false,
}: AuthFormProps) {
  return (
    <form action={action} className="rounded-[1.5rem] bg-white p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {title}
      </p>
      <p className="mt-2 text-sm text-[var(--text-soft)]">{description}</p>

      <div className="mt-5 space-y-2">
        {includeName ? (
          <input
            name="fullName"
            type="text"
            placeholder="Seu nome"
            className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
          />
        ) : null}
        <input
          name="email"
          type="email"
          placeholder="voce@email.com"
          required
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Sua senha"
          required
          className="w-full rounded-xl border border-[var(--line)] bg-[var(--bg)] px-3 py-2 text-sm outline-none"
        />
      </div>

      <button
        type="submit"
        className="mt-4 w-full rounded-full bg-[var(--text)] px-4 py-2.5 text-sm font-semibold text-white"
      >
        {submitLabel}
      </button>
    </form>
  );
}
