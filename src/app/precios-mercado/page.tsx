import { getMarketPrices } from "@/actions/market-prices";
import MarketPricesClient from "@/components/market-prices/MarketPricesClient";
import type { Metadata } from "next";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Precios de Mercado Agrícola",
  description:
    "Consulta los precios actualizados de los principales productos agrícolas de Costa Rica. Monitorea tendencias y recibe alertas de cambios significativos.",
  openGraph: {
    title: "Precios de Mercado Agrícola - Agrotico Smart Dashboard",
    description:
      "Precios actualizados de café, arroz, maíz, frijol, tomate, papa y caña de azúcar en Costa Rica.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Precios de Mercado Agrícola - Agrotico Smart Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Precios de Mercado Agrícola - Agrotico Smart Dashboard",
    description: "Consulta los precios actualizados de productos agrícolas en Costa Rica",
    images: ["/logo.svg"],
  },
};

export default async function MarketPricesPage() {
  const marketData = await getMarketPrices();

  return <MarketPricesClient marketData={marketData} />;
}
