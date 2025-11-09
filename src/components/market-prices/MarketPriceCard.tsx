"use client";

import { MarketPrice } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MarketPriceCardProps {
  price: MarketPrice;
}

export default function MarketPriceCard({ price }: MarketPriceCardProps) {
  const getTrendIcon = () => {
    if (!price.tendencia) return <Minus className="h-4 w-4 text-gray-400" />;
    
    switch (price.tendencia) {
      case 'subida':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bajada':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    if (!price.cambio_porcentual) return 'text-gray-600';
    return price.cambio_porcentual > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center justify-between">
          <span>{price.producto}</span>
          {getTrendIcon()}
        </CardTitle>
        <p className="text-sm text-gray-500">{price.region}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <p className="text-3xl font-bold text-primary">
              {formatPrice(price.precio_actual)}
            </p>
            <p className="text-sm text-gray-500">por {price.unidad}</p>
          </div>
          
          {price.cambio_porcentual !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${getTrendColor()}`}>
              <span>
                {price.cambio_porcentual > 0 ? '+' : ''}
                {price.cambio_porcentual.toFixed(2)}%
              </span>
              {price.precio_anterior && (
                <span className="text-xs text-gray-500">
                  (desde {formatPrice(price.precio_anterior)})
                </span>
              )}
            </div>
          )}
          
          <p className="text-xs text-gray-400">
            Actualizado: {new Date(price.fecha).toLocaleDateString('es-CR')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
