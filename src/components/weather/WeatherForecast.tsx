"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Cloud,
} from "lucide-react";

interface WeatherForecastProps {
  region: string;
  crop: string;
  startDate: Date | undefined;
}

interface ForecastEntry {
  date: string;
  temperatura: number;
  humedad: number;
  precipitacion: number;
  viento: number;
}

export default function WeatherForecast({
  region,
  crop,
  startDate,
}: WeatherForecastProps) {
  const [forecastData, setForecastData] = useState<ForecastEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coordenadas por región de Costa Rica 🇨🇷
  const regionCoords: Record<string, { lat: number; lon: number }> = {
    central: { lat: 9.93, lon: -84.08 }, // San José (Valle Central)
    norte: { lat: 10.47, lon: -84.65 }, // Ciudad Quesada (Zona Norte)
    sur: { lat: 8.65, lon: -83.16 }, // Golfito (Pacífico Sur)
    pacifico: { lat: 9.98, lon: -84.83 }, // Puntarenas (Pacífico Central)
    atlantico: { lat: 10.02, lon: -83.07 }, // Limón (Caribe)
  };

  useEffect(() => {
    if (!region || !startDate) return;
    const coords = regionCoords[region];
    if (!coords) {
      setError("Región no soportada");
      return;
    }

    const fetchWeather = async () => {
      setLoading(true);
      setError(null);

      try {
        // Formatear fechas en formato YYYY-MM-DD
        const start = startDate.toISOString().split("T")[0];
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // 7 días de pronóstico
        const end = endDate.toISOString().split("T")[0];

        // Construir URL con rango de fechas
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,relative_humidity_2m_max,relative_humidity_2m_min&timezone=auto&start_date=${start}&end_date=${end}`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data?.daily) throw new Error("Datos no disponibles");

        const processed: ForecastEntry[] = data.daily.time.map(
          (date: string, i: number) => ({
            date: new Date(date).toLocaleDateString("es-ES", {
              weekday: "short",
              day: "numeric",
              timeZone: "America/Costa_Rica",
            }),
            temperatura:
              (data.daily.temperature_2m_max[i] +
                data.daily.temperature_2m_min[i]) / 2,
            humedad:
              (data.daily.relative_humidity_2m_max[i] +
                data.daily.relative_humidity_2m_min[i]) / 2,
            precipitacion: data.daily.precipitation_sum[i],
            viento: data.daily.windspeed_10m_max[i],
          })
        );

        setForecastData(processed.slice(0, 7));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [region, startDate]);

  // Estados de carga y error
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

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-gray-500">Cargando pronóstico...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-96">
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!forecastData.length) return null;

  return (
    <div className="space-y-6">
      {/* Resumen del día */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Temperatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0].temperatura.toFixed(1)}°C
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Humedad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0].humedad.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Precipitación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0].precipitacion.toFixed(1)}mm
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Viento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {forecastData[0].viento.toFixed(1)} km/h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Temperatura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Pronóstico de Temperatura
          </CardTitle>
          <CardDescription>
            Temperatura promedio diaria (°C)
          </CardDescription>
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
                name="Temperatura (°C)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Precipitación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain className="h-5 w-5" />
            Pronóstico de Precipitación
          </CardTitle>
          <CardDescription>
            Lluvia total esperada (mm)
          </CardDescription>
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

      {/* Gráfico de Humedad y Viento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Humedad y Viento
          </CardTitle>
          <CardDescription>
            Promedio de humedad (%) y viento máximo (km/h)
          </CardDescription>
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
