"use server";

import { NewsResponse } from "@/lib/types";

/**
 * Server action para obtener noticias agrícolas
 */
export async function getAgricultureNews(): Promise<NewsResponse> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/noticias`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NewsResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching news:", error);
    return {
      success: false,
      articles: [],
      lastUpdate: new Date().toISOString(),
      error: "Error al cargar las noticias",
    };
  }
}
