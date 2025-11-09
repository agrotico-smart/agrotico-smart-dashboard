"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, Newspaper } from "lucide-react";

interface NewsHeaderProps {
  lastUpdate: string;
  onRefresh: () => void;
  loading?: boolean;
}

export default function NewsHeader({
  lastUpdate,
  onRefresh,
  loading = false,
}: NewsHeaderProps) {
  const formattedDate = new Date(lastUpdate).toLocaleString("es-CR", {
    dateStyle: "full",
    timeStyle: "short",
  });

  return (
    <div className="mb-8">
      {/* Cabecera estilo periódico */}
      <div className="border-b-4 border-slate-900 pb-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Newspaper className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
                Noticias Agrícolas
              </h1>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Costa Rica • Información Confiable para el Agricultor
              </p>
            </div>
          </div>
          <Button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Línea de fecha estilo periódico */}
      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-b border-slate-300 py-2 px-4 bg-slate-50">
        <span className="font-semibold uppercase tracking-wide">
          Última actualización
        </span>
        <span>{formattedDate}</span>
      </div>
    </div>
  );
}
