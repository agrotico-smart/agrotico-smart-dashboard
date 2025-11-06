import WeatherClient from "@/components/weather/WeatherClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pronóstico del Clima",
  description:
    "Consulta pronósticos del clima y simula escenarios climáticos para optimizar tus decisiones agrícolas. Visualiza temperatura, humedad, precipitación y más.",
  openGraph: {
    title: "Pronóstico del Clima - Agrotico Smart Dashboard",
    description:
      "Consulta pronósticos del clima y simula escenarios climáticos para optimizar tus decisiones agrícolas.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Pronóstico del Clima - Agrotico Smart Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pronóstico del Clima - Agrotico Smart Dashboard",
    description:
      "Consulta pronósticos y simula escenarios climáticos para agricultura.",
    images: ["/logo.svg"],
  },
};

export default function ClimaPage() {
  return <WeatherClient />;
}
