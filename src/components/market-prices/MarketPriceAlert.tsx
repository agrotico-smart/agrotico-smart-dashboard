"use client";

import { MarketPriceAlert } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";

interface MarketPriceAlertProps {
  alerts: MarketPriceAlert[];
}

export default function MarketPriceAlerts({ alerts }: MarketPriceAlertProps) {
  if (alerts.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-green-800">
          <AlertTriangle className="h-5 w-5" />
          <p className="font-medium">No hay cambios significativos en los precios</p>
        </div>
      </div>
    );
  }

  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Alertas de Precio (últimos 7 días)
      </h3>
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          className={
            alert.tipo === 'subida'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }
        >
          <div className="flex items-start gap-3">
            {alert.tipo === 'subida' ? (
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <AlertTitle className="text-base font-semibold mb-1">
                {alert.producto} - {alert.region}
              </AlertTitle>
              <AlertDescription className="text-sm">
                El precio {alert.tipo === 'subida' ? 'subió' : 'bajó'} un{' '}
                <strong className={alert.tipo === 'subida' ? 'text-green-700' : 'text-red-700'}>
                  {alert.cambio_porcentual.toFixed(1)}%
                </strong>{' '}
                esta semana.
                <br />
                <span className="text-xs text-gray-600">
                  De {formatPrice(alert.precio_anterior)} a {formatPrice(alert.precio_actual)}
                  {' · '}
                  {new Date(alert.fecha).toLocaleDateString('es-CR')}
                </span>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
