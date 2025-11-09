"use client";

import React from "react";
import {
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  Wind,
  Gauge,
  Activity,
  Clock,
  Battery,
  Wifi,
  Signal,
  Database,
  Cloud,
  Zap,
  Eye,
  Target,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RobotStats } from "@/lib/types";
import { SensorData } from "@/actions/sensors";

interface MetricCardProps {
  title: string;
  value: string | number;
  unit: string;
  icon: React.ReactNode;
  status: "excellent" | "good" | "warning" | "critical";
  trend?: "up" | "down" | "stable";
  lastUpdate?: string;
  description?: string;
}

const MetricCard = ({
  title,
  value,
  unit,
  icon,
  status,
  trend,
  lastUpdate,
  description,
}: MetricCardProps) => {
  const statusColors = {
    excellent: "bg-emerald-50 text-emerald-700 border-emerald-200",
    good: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    critical: "bg-red-50 text-red-700 border-red-200",
  };

  const trendIcons = {
    up: <TrendingUp className="h-3 w-3 text-emerald-500" />,
    down: <TrendingDown className="h-3 w-3 text-red-500" />,
    stable: <Minus className="h-3 w-3 text-slate-500" />,
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
              {icon}
            </div>
            <div>
              <CardTitle className="text-sm font-medium text-slate-600">
                {title}
              </CardTitle>
              {description && (
                <p className="text-xs text-slate-500 mt-1">{description}</p>
              )}
            </div>
          </div>
          <Badge className={statusColors[status]} variant="outline">
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
          <span className="text-sm text-slate-500 font-medium">{unit}</span>
          {trend && (
            <div className="flex items-center space-x-1">
              {trendIcons[trend]}
            </div>
          )}
        </div>
        {lastUpdate && (
          <p className="text-xs text-slate-400 mt-2 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {lastUpdate}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface RealtimeMetricsProps {
  sensorData: SensorData | null;
  robot: RobotStats | null;
}

export default function RealtimeMetrics({
  sensorData,
  robot,
}: RealtimeMetricsProps) {
  const getStatus = (
    value: number,
    thresholds: { excellent: number; good: number; warning: number }
  ) => {
    if (value >= thresholds.excellent) return "excellent";
    if (value >= thresholds.good) return "good";
    if (value >= thresholds.warning) return "warning";
    return "critical";
  };

  const getTrend = (value: number, optimal: number) => {
    const diff = value - optimal;
    if (Math.abs(diff) < optimal * 0.05) return "stable";
    return diff > 0 ? "up" : "down";
  };

  const temperature = sensorData?.temperature?.temperatura_celsius || 0;
  const humidity = sensorData?.humidity?.humedad_pct || 0;
  const co2 = sensorData?.humidity?.co2_ppm || 0;
  const light = sensorData?.light?.lux || 0;
  const soilHumidity = sensorData?.soil?.humedad_suelo || 0;
  const soilTemp = sensorData?.soil?.temperatura_suelo_celsius || 0;
  const pressure = sensorData?.temperature?.presion_hpa || 0;
  const uvIndex = sensorData?.light?.indice_uv || 0;

  // Climate data
  const climateTemp = sensorData?.climate?.temperatura_2m || 0;
  const windSpeed = sensorData?.climate?.velocidad_viento || 0;
  const precipitation = sensorData?.climate?.precipitacion_corregida || 0;
  const radiation = sensorData?.climate?.radiacion_onda_corta || 0;

  return (
    <div className="space-y-6">
      {/* Environmental Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Métricas Ambientales</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Temperatura Ambiente"
            value={temperature.toFixed(1)}
            unit="°C"
            icon={<Thermometer className="h-5 w-5" />}
            status={getStatus(temperature, { excellent: 25, good: 20, warning: 15 })}
            trend={getTrend(temperature, 22)}
            lastUpdate="Hace 2 min"
            description="Temperatura del aire"
          />
          <MetricCard
            title="Humedad Relativa"
            value={humidity.toFixed(1)}
            unit="%"
            icon={<Droplets className="h-5 w-5" />}
            status={getStatus(humidity, { excellent: 60, good: 50, warning: 40 })}
            trend={getTrend(humidity, 55)}
            lastUpdate="Hace 1 min"
            description="Humedad del aire"
          />
          <MetricCard
            title="Concentración CO2"
            value={co2.toFixed(0)}
            unit="ppm"
            icon={<Cloud className="h-5 w-5" />}
            status={getStatus(co2, { excellent: 400, good: 600, warning: 800 })}
            trend={getTrend(co2, 500)}
            lastUpdate="Hace 3 min"
            description="Dióxido de carbono"
          />
          <MetricCard
            title="Luz Solar"
            value={light.toFixed(0)}
            unit="lux"
            icon={<Sun className="h-5 w-5" />}
            status={getStatus(light, { excellent: 800, good: 500, warning: 200 })}
            trend={getTrend(light, 600)}
            lastUpdate="Hace 5 min"
            description="Intensidad lumínica"
          />
        </div>
      </div>

      {/* Soil Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Métricas del Suelo</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Humedad del Suelo"
            value={soilHumidity}
            unit=""
            icon={<Leaf className="h-5 w-5" />}
            status={getStatus(soilHumidity, { excellent: 400, good: 300, warning: 200 })}
            trend={getTrend(soilHumidity, 350)}
            lastUpdate="Hace 2 min"
            description="Humedad del suelo"
          />
          <MetricCard
            title="Temperatura del Suelo"
            value={soilTemp.toFixed(1)}
            unit="°C"
            icon={<Thermometer className="h-5 w-5" />}
            status={getStatus(soilTemp, { excellent: 25, good: 20, warning: 15 })}
            trend={getTrend(soilTemp, 22)}
            lastUpdate="Hace 4 min"
            description="Temperatura del suelo"
          />
          <MetricCard
            title="Índice UV"
            value={uvIndex.toFixed(1)}
            unit=""
            icon={<Sun className="h-5 w-5" />}
            status={getStatus(uvIndex, { excellent: 3, good: 6, warning: 8 })}
            trend={getTrend(uvIndex, 5)}
            lastUpdate="Hace 3 min"
            description="Índice ultravioleta"
          />
        </div>
      </div>

      {/* Atmospheric Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Métricas Atmosféricas</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Presión Atmosférica"
            value={pressure.toFixed(1)}
            unit="hPa"
            icon={<Gauge className="h-5 w-5" />}
            status={getStatus(pressure, { excellent: 1013, good: 1000, warning: 950 })}
            trend={getTrend(pressure, 1013)}
            lastUpdate="Hace 1 min"
            description="Presión barométrica"
          />
          <MetricCard
            title="Velocidad del Viento"
            value={windSpeed.toFixed(1)}
            unit="m/s"
            icon={<Wind className="h-5 w-5" />}
            status={getStatus(windSpeed, { excellent: 3, good: 5, warning: 8 })}
            trend={getTrend(windSpeed, 4)}
            lastUpdate="Hace 2 min"
            description="Velocidad del viento"
          />
          <MetricCard
            title="Precipitación"
            value={precipitation.toFixed(1)}
            unit="mm"
            icon={<Droplets className="h-5 w-5" />}
            status={precipitation > 0 ? "good" : "excellent"}
            trend={precipitation > 0 ? "up" : "stable"}
            lastUpdate="Hace 5 min"
            description="Lluvia acumulada"
          />
          <MetricCard
            title="Radiación Solar"
            value={radiation.toFixed(0)}
            unit="W/m²"
            icon={<Zap className="h-5 w-5" />}
            status={getStatus(radiation, { excellent: 800, good: 500, warning: 200 })}
            trend={getTrend(radiation, 600)}
            lastUpdate="Hace 3 min"
            description="Radiación solar"
          />
        </div>
      </div>

      {/* System Status */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Estado del Robot
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <Badge className={
                  robot?.estado === "activo"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
                }>
                  {robot?.estado === "activo" ? (
                    <CheckCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mr-1" />
                  )}
                  {robot?.estado || "Desconocido"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                  <Wifi className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Conexión
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center space-x-2">
                <Signal className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-semibold text-slate-900">Excelente</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">-45 dBm</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Battery className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Batería
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">87%</span>
                <span className="text-sm text-slate-500">cargada</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className="bg-amber-500 h-2 rounded-full"
                  style={{ width: "87%" }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all duration-200 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Registros
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-slate-900">
                  {robot?.total_registros || 0}
                </span>
                <span className="text-sm text-slate-500">total</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Última actualización:{" "}
                {new Date().toLocaleTimeString("es-ES", {
                  timeZone: "America/Costa_Rica",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}