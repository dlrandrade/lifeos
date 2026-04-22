import { AppShell } from "@/components/app-shell";
import { getCurrentUserContext } from "@/server/app-data";

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await getCurrentUserContext();
  return <AppShell>{children}</AppShell>;
}
