"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Thermometer, Droplets, Wind, CloudRain, Sun, Cloud } from "lucide-react";

interface WeatherForecastProps {
  region: string;
  crop: string;
  startDate: Date | undefined;
}

export default function WeatherForecast({ region, crop, startDate }: WeatherForecastProps) {
  // Generate mock forecast data - deterministic based on inputs
  const forecastData = useMemo(() => {
    if (!region || !startDate) return [];

    const data = [];
    const baseTemp = region === "norte" ? 28 : region === "sur" ? 18 : 23;
    // Use date as seed for deterministic variation
    const seed = startDate.getDate() + startDate.getMonth() * 31;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Deterministic pseudo-random using seed
      const dayVariation = Math.sin(seed + i * 2.5) * 0.5 + 0.5;
      
      data.push({
        date: date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }),
        temperatura: baseTemp + Math.sin(i) * 3 + dayVariation * 2,
        humedad: 60 + dayVariation * 20,
        precipitacion: dayVariation * 15,
        viento: 5 + dayVariation * 10,
      });
    }
    
    return data;
  }, [region, crop, startDate]);

  if (!region) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center text-gray-500">
            <Cloud className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p>Selecciona una región para ver el pronóstico</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Weather Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-red-500" />
              Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0]?.temperatura.toFixed(1)}°C
            </div>
            <p className="text-xs text-gray-500">Promedio del día</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              Humedad
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0]?.humedad.toFixed(0)}%
            </div>
            <p className="text-xs text-gray-500">Humedad relativa</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-indigo-500" />
              Precipitación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0]?.precipitacion.toFixed(1)}mm
            </div>
            <p className="text-xs text-gray-500">Esperada hoy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wind className="h-4 w-4 text-green-500" />
              Viento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0]?.viento.toFixed(1)} km/h
            </div>
            <p className="text-xs text-gray-500">Velocidad promedio</p>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Pronóstico de Temperatura
          </CardTitle>
          <CardDescription>Temperatura promedio para los próximos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperatura" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Temperatura (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Precipitation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            Pronóstico de Precipitación
          </CardTitle>
          <CardDescription>Precipitación esperada para los próximos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="precipitacion" 
                fill="#3b82f6" 
                name="Precipitación (mm)"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Humidity and Wind Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Humedad y Viento
          </CardTitle>
          <CardDescription>Pronóstico de humedad y velocidad del viento</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="humedad" 
                stroke="#06b6d4" 
                strokeWidth={2}
                name="Humedad (%)"
              />
              <Line 
                type="monotone" 
                dataKey="viento" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Viento (km/h)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
