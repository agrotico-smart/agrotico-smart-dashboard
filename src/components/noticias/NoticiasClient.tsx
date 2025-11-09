"use client";

import { useState, useTransition } from "react";
import { NewsArticle } from "@/lib/types";
import { getAgricultureNews } from "@/actions/noticias";
import NewsHeader from "./NewsHeader";
import NewsList from "./NewsList";

interface NoticiasClientProps {
  initialArticles: NewsArticle[];
  initialLastUpdate: string;
}

export default function NoticiasClient({
  initialArticles,
  initialLastUpdate,
}: NoticiasClientProps) {
  const [articles, setArticles] = useState<NewsArticle[]>(initialArticles);
  const [lastUpdate, setLastUpdate] = useState(initialLastUpdate);
  const [isPending, startTransition] = useTransition();

  const handleRefresh = () => {
    startTransition(async () => {
      const result = await getAgricultureNews();
      if (result.success) {
        setArticles(result.articles);
        setLastUpdate(result.lastUpdate);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewsHeader
          lastUpdate={lastUpdate}
          onRefresh={handleRefresh}
          loading={isPending}
        />
        <NewsList articles={articles} loading={isPending} />
      </div>
    </div>
  );
}
