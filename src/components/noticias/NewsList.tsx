"use client";

import { NewsArticle } from "@/lib/types";
import NewsCard from "./NewsCard";
import { AlertCircle } from "lucide-react";

interface NewsListProps {
  articles: NewsArticle[];
  loading?: boolean;
}

export default function NewsList({ articles, loading = false }: NewsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="animate-pulse bg-slate-200 rounded-lg h-96"
          />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <AlertCircle className="h-16 w-16 text-slate-400 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 mb-2">
          No hay noticias disponibles
        </h3>
        <p className="text-slate-500 text-center max-w-md">
          No se pudieron cargar las noticias en este momento. Por favor, intenta
          nuevamente más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}
