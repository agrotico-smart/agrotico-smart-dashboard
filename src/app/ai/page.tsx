import { getCurrentSensorData } from "@/actions/ai";
import AIChatInterface from "@/components/ai/AIChatInterface";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Asistente de IA Agrícola",
  description:
    "Obtén insights inteligentes sobre tus cultivos con nuestro asistente de IA especializado en agricultura. Análisis predictivo, recomendaciones y monitoreo inteligente.",
  openGraph: {
    title: "Asistente de IA Agrícola - Agrotico Smart Dashboard",
    description:
      "Obtén insights inteligentes sobre tus cultivos con nuestro asistente de IA especializado en agricultura.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Asistente de IA Agrícola - Agrotico Smart Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asistente de IA Agrícola - Agrotico Smart Dashboard",
    description:
      "Obtén insights inteligentes sobre tus cultivos con IA especializada en agricultura.",
    images: ["/logo.svg"],
  },
};

export default async function AIPage() {
  const initialSensorData = await getCurrentSensorData();

  return <AIChatInterface initialSensorData={initialSensorData} />;
}
