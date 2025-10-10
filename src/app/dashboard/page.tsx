import { getRobotsData } from "@/actions/dashboard";
import DashboardServer from "@/components/DashboardServer";
import type { Metadata } from "next";

// Forzar renderizado dinámico para evitar problemas con archivos de referencia
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Dashboard de Robots",
  description:
    "Monitorea y gestiona tus robots agrícolas en tiempo real. Visualiza datos de sensores, métricas de rendimiento y obtén insights inteligentes.",
  openGraph: {
    title: "Dashboard de Robots - Agrotico Smart Dashboard",
    description:
      "Monitorea y gestiona tus robots agrícolas en tiempo real. Visualiza datos de sensores, métricas de rendimiento y obtén insights inteligentes.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Dashboard de Robots - Agrotico Smart Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dashboard de Robots - Agrotico Smart Dashboard",
    description: "Monitorea y gestiona tus robots agrícolas en tiempo real.",
    images: ["/logo.svg"],
  },
};

export default async function DashboardPage() {
  const { robots, lastUpdate } = await getRobotsData();

  return (
    <DashboardServer initialRobots={robots} initialLastUpdate={lastUpdate} />
  );
}
