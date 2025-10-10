import { getRobotsData } from "@/actions/dashboard";
import DashboardServer from "@/components/DashboardServer";

export default async function HomePage() {
  const { robots, lastUpdate } = await getRobotsData();

  return (
    <DashboardServer initialRobots={robots} initialLastUpdate={lastUpdate} />
  );
}
