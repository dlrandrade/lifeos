import { DashboardPage } from "@/components/dashboard-page";
import { getDashboardData } from "@/server/app-data";

export default async function DashboardRoute() {
  const data = await getDashboardData();
  return <DashboardPage data={data} />;
}
