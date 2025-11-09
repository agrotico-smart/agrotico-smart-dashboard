"use client";

import { NewsArticle } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { ExternalLink, Calendar, Tag } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface NewsCardProps {
  article: NewsArticle;
}

export default function NewsCard({ article }: NewsCardProps) {
  const formattedDate = formatDistanceToNow(new Date(article.pubDate), {
    addSuffix: true,
    locale: es,
  });

  const handleOpenArticle = () => {
    window.open(article.link, "_blank", "noopener,noreferrer");
  };

  return (
    <Card
      className="group overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border-slate-200"
      onClick={handleOpenArticle}
    >
      {/* Imagen de portada */}
      {article.imageUrl && (
        <div className="relative h-48 overflow-hidden bg-slate-100">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Ocultar imagen si falla la carga
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Fuente y categoría */}
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
          <Tag className="h-3 w-3" />
          <span className="font-semibold text-blue-600">{article.source}</span>
          {article.categories && article.categories.length > 0 && (
            <>
              <span>•</span>
              <span>{article.categories[0]}</span>
            </>
          )}
        </div>

        {/* Título estilo periódico */}
        <h2 className="text-xl font-bold text-slate-900 mb-3 leading-tight line-clamp-3 group-hover:text-blue-600 transition-colors duration-200">
          {article.title}
        </h2>

        {/* Descripción */}
        <p className="text-slate-700 text-sm leading-relaxed mb-4 line-clamp-3">
          {article.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 font-medium group-hover:gap-2 transition-all duration-200">
            <span>Leer más</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        </div>
      </div>
    </Card>
  );
}
