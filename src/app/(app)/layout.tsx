import { getCurrentUserContext } from "@/server/app-data";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await getCurrentUserContext();
  return (
    <div className="safe-area min-h-[100dvh] bg-[var(--bg)] sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-[768px]">{children}</div>
    </div>
  );
}
