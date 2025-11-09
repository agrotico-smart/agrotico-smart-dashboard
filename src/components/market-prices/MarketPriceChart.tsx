"use client";

import { MarketPriceHistory } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface MarketPriceChartProps {
  history: MarketPriceHistory;
}

export default function MarketPriceChart({ history }: MarketPriceChartProps) {
  const formatPrice = (precio: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(precio);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CR', { month: 'short', day: 'numeric' });
  };

  const data = history.historial.map(item => ({
    fecha: formatDate(item.fecha),
    precio: item.precio,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          Tendencia de precios - {history.producto} ({history.region})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="fecha" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                fontSize={12}
                tickFormatter={(value) => formatPrice(value)}
              />
              <Tooltip 
                formatter={(value: number) => formatPrice(value)}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="precio" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Precio"
                dot={{ fill: '#2563eb', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No hay datos históricos disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
}
