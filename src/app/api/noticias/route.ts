import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { NewsArticle, NewsResponse } from "@/lib/types";

// Forzar renderizado dinámico
export const dynamic = "force-dynamic";
export const revalidate = 86400; // Revalidar cada 24 horas (86400 segundos)

// Configurar parser RSS
const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; AgrotioNewsBot/1.0)",
  },
});

// Fuentes de noticias agrícolas de Costa Rica
const NEWS_SOURCES = [
  {
    name: "La Nación - Agro",
    url: "https://www.nacion.com/economia/agro/rss.xml",
    category: "Economía Agrícola",
  },
  {
    name: "CRHoy - Agricultura",
    url: "https://www.crhoy.com/feed/",
    category: "Noticias Generales",
  },
];

// Cache en memoria para modo offline
let cachedNews: NewsArticle[] = [];
let lastFetchTime = 0;
const CACHE_DURATION = 86400000; // 24 horas en milisegundos

/**
 * Extrae imagen de contenido HTML/XML
 */
function extractImageFromContent(content: string | undefined): string | undefined {
  if (!content) return undefined;
  
  // Buscar etiquetas de imagen en el contenido
  const imgRegex = /<img[^>]+src="([^">]+)"/i;
  const match = content.match(imgRegex);
  
  if (match && match[1]) {
    return match[1];
  }
  
  // Buscar URLs de imágenes directas
  const urlRegex = /(https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp))/i;
  const urlMatch = content.match(urlRegex);
  
  return urlMatch ? urlMatch[1] : undefined;
}

/**
 * Limpia el HTML del contenido
 * React se encarga del escape automático, así que solo removemos las etiquetas HTML
 */
function cleanHtmlContent(html: string | undefined): string {
  if (!html) return "";
  
  // Remover etiquetas HTML y normalizar espacios
  // No decodificamos entidades HTML manualmente para evitar double-escaping
  // React se encargará del escape correcto al renderizar
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Obtiene noticias de una fuente RSS
 */
async function fetchFromSource(
  source: { name: string; url: string; category: string }
): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    
    return feed.items.slice(0, 5).map((item, index) => {
      const imageUrl = 
        (item as any).enclosure?.url ||
        (item as any)["media:content"]?.$ ||
        extractImageFromContent((item as any)["content:encoded"] || item.content);
      
      return {
        id: `${source.name}-${Date.now()}-${index}`,
        title: item.title || "Sin título",
        description: cleanHtmlContent(item.contentSnippet || item.content) || "Sin descripción",
        content: cleanHtmlContent((item as any)["content:encoded"] || item.content),
        link: item.link || "",
        pubDate: item.pubDate || new Date().toISOString(),
        source: source.name,
        imageUrl: imageUrl,
        categories: item.categories || [source.category],
      };
    });
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error);
    return [];
  }
}

/**
 * Endpoint GET para obtener noticias agrícolas
 */
export async function GET() {
  try {
    const now = Date.now();
    
    // Si hay cache válido, retornar desde cache
    if (cachedNews.length > 0 && now - lastFetchTime < CACHE_DURATION) {
      console.log("✅ Returning cached news");
      return NextResponse.json({
        success: true,
        articles: cachedNews,
        lastUpdate: new Date(lastFetchTime).toISOString(),
        cached: true,
      } as NewsResponse);
    }

    console.log("🔄 Fetching fresh news from sources...");

    // Obtener noticias de todas las fuentes en paralelo
    const newsPromises = NEWS_SOURCES.map((source) => fetchFromSource(source));
    const newsResults = await Promise.all(newsPromises);

    // Combinar y ordenar por fecha
    const allNews = newsResults
      .flat()
      .sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())
      .slice(0, 10); // Limitar a 10 noticias más recientes

    // Actualizar cache
    cachedNews = allNews;
    lastFetchTime = now;

    console.log(`✅ Fetched ${allNews.length} news articles`);

    return NextResponse.json({
      success: true,
      articles: allNews,
      lastUpdate: new Date(lastFetchTime).toISOString(),
      cached: false,
    } as NewsResponse);
  } catch (error) {
    console.error("❌ Error fetching agricultural news:", error);

    // En caso de error, intentar retornar cache aunque esté vencido
    if (cachedNews.length > 0) {
      return NextResponse.json({
        success: true,
        articles: cachedNews,
        lastUpdate: new Date(lastFetchTime).toISOString(),
        cached: true,
        error: "Error al obtener noticias frescas, mostrando cache",
      } as NewsResponse);
    }

    return NextResponse.json(
      {
        success: false,
        articles: [],
        lastUpdate: new Date().toISOString(),
        error: "Error al cargar noticias agrícolas",
      } as NewsResponse,
      { status: 500 }
    );
  }
}
