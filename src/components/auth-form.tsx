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
    <form action={action} className="rounded-[2rem] bg-white p-6 shadow-[0_20px_70px_rgba(33,27,19,0.08)]">
      <p className="text-xs uppercase tracking-[0.24em] text-muted">{title}</p>
      <p className="mt-3 text-sm leading-6 text-muted">{description}</p>

      <div className="mt-6 space-y-3">
        {includeName ? (
          <input
            name="fullName"
            type="text"
            placeholder="Seu nome"
            className="w-full rounded-2xl border border-line bg-[#f7f3ed] px-4 py-3 text-sm outline-none"
          />
        ) : null}
        <input
          name="email"
          type="email"
          placeholder="voce@email.com"
          className="w-full rounded-2xl border border-line bg-[#f7f3ed] px-4 py-3 text-sm outline-none"
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Sua senha"
          className="w-full rounded-2xl border border-line bg-[#f7f3ed] px-4 py-3 text-sm outline-none"
          required
        />
      </div>

      <button
        type="submit"
        className="mt-5 rounded-full bg-[#161616] px-5 py-3 text-sm font-semibold text-[#f8f3eb]"
      >
        {submitLabel}
      </button>
    </form>
  );
}
