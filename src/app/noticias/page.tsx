import { getAgricultureNews } from "@/actions/noticias";
import NoticiasClient from "@/components/noticias/NoticiasClient";
import type { Metadata } from "next";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";
export const revalidate = 86400; // Revalidar cada 24 horas

export const metadata: Metadata = {
  title: "Noticias Agrícolas",
  description:
    "Mantente informado con las últimas noticias agrícolas de Costa Rica. Políticas, programas, clima, plagas y eventos del sector agrícola.",
  openGraph: {
    title: "Noticias Agrícolas - Agrotico Smart Dashboard",
    description:
      "Mantente informado con las últimas noticias agrícolas de Costa Rica. Políticas, programas, clima, plagas y eventos del sector agrícola.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Noticias Agrícolas - Agrotico Smart Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Noticias Agrícolas - Agrotico Smart Dashboard",
    description:
      "Mantente informado con las últimas noticias agrícolas de Costa Rica.",
    images: ["/logo.svg"],
  },
};

export default async function NoticiasPage() {
  const { articles, lastUpdate } = await getAgricultureNews();

  return (
    <NoticiasClient initialArticles={articles} initialLastUpdate={lastUpdate} />
  );
}
