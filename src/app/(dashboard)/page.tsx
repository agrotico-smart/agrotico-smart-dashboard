import { getRobotsData } from "@/actions/dashboard";
import DashboardServer from "@/components/DashboardServer";

// Forzar renderizado dinámico para evitar problemas con archivos de referencia
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const { robots, lastUpdate } = await getRobotsData();

  return (
    <DashboardServer initialRobots={robots} initialLastUpdate={lastUpdate} />
  );
}
