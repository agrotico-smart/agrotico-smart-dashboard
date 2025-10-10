import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import RootLayoutClient from "./RootLayoutClient";
import SessionProviderWrapper from "@/components/providers/SessionProviderWrapper";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Agrotico Smart Dashboard",
    template: "%s | Agrotico Smart Dashboard",
  },
  description:
    "Sistema de Monitoreo Agrícola Inteligente con IA. Monitorea robots agrícolas, sensores IoT y obtén insights inteligentes para optimizar tu producción agrícola.",
  keywords: [
    "agricultura inteligente",
    "IoT agrícola",
    "monitoreo de cultivos",
    "sensores agrícolas",
    "robots agrícolas",
    "agricultura de precisión",
    "IA agrícola",
    "dashboard agrícola",
  ],
  authors: [{ name: "Agrotico Team" }],
  creator: "Agrotico",
  publisher: "Agrotico",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://agrotico-smart-dashboard.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://agrotico-smart-dashboard.vercel.app",
    title: "Agrotico Smart Dashboard - Agricultura Inteligente",
    description:
      "Sistema de Monitoreo Agrícola Inteligente con IA. Monitorea robots agrícolas, sensores IoT y obtén insights inteligentes para optimizar tu producción agrícola.",
    siteName: "Agrotico Smart Dashboard",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Agrotico Smart Dashboard - Sistema de Monitoreo Agrícola Inteligente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Agrotico Smart Dashboard - Agricultura Inteligente",
    description:
      "Sistema de Monitoreo Agrícola Inteligente con IA. Monitorea robots agrícolas, sensores IoT y obtén insights inteligentes.",
    images: ["/logo.svg"],
    creator: "@agrotico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Reemplaza con tu código real
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <RootLayoutClient>{children}</RootLayoutClient>
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
