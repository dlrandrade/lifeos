import { getCurrentUserContext } from "@/server/app-data";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await getCurrentUserContext();
  return (
    <div className="min-h-screen bg-[var(--bg)] px-3 py-3 sm:px-6 sm:py-6">
      <div className="mx-auto w-full max-w-md sm:max-w-2xl">{children}</div>
    </div>
  );
}
