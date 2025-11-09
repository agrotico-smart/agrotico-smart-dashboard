"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Zap,
  TrendingUp,
  BarChart3,
  Activity,
  Settings,
  Database,
  Maximize2,
  Minimize2,
  RotateCcw,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { SensorData } from "@/actions/sensors";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface HistoricalDataPoint {
  timestamp: string;
  temperatura_celsius: number;
  humedad_pct: number;
  lux: number;
  humedad_suelo: number;
  co2_ppm: number;
  presion_hpa: number;
  indice_uv: number;
  temperatura_suelo_celsius: number;
}

interface RobotChartsProps {
  sensorData: SensorData | null;
  historicalData: HistoricalDataPoint[];
  onGenerateRecord?: () => void;
}

type EmptyStateReason =
  | "no-data"
  | "no-match"
  | "missing-custom"
  | "invalid-range";

const parseTimestamp = (value: unknown) => {
  if (!value) return null;

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }

  if (typeof value === "string") {
    // MySQL returns timestamps in the format "YYYY-MM-DD HH:MM:SS"
    // Since we configured the DB connection with timezone: '-06:00',
    // these timestamps are already in Costa Rica time.
    // We need to parse them explicitly to avoid browser timezone conversion.
    const normalized = value.includes("T") ? value : value.replace(" ", "T");
    const parsed = new Date(normalized);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
};

const toInputLocalValue = (raw: unknown) => {
  const date = parseTimestamp(raw);
  if (!date) return "";

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  const hours = `${date.getHours()}`.padStart(2, "0");
  const minutes = `${date.getMinutes()}`.padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Violet
  "#06B6D4", // Cyan
  "#84CC16", // Lime
  "#F97316", // Orange
];

const CHART_HEIGHT = 250; // Responsive chart height in pixels

export default function RobotCharts({
  sensorData,
  historicalData = [],
  onGenerateRecord,
}: RobotChartsProps) {
  const [dataLimit, setDataLimit] = useState<"20" | "50" | "100" | "200">("20");
  const [chartType, setChartType] = useState<"line" | "bar" | "area">("line");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeRange, setTimeRange] = useState<
    "1h" | "6h" | "24h" | "7d" | "30d" | "custom"
  >("24h");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  useEffect(() => {
    if (timeRange !== "custom" || historicalData.length === 0) {
      return;
    }

    if (!customStartDate) {
      const first = toInputLocalValue(historicalData[0].timestamp);
      if (first) {
        setCustomStartDate(first);
      }
    }

    if (!customEndDate) {
      const last = toInputLocalValue(
        historicalData[historicalData.length - 1].timestamp
      );
      if (last) {
        setCustomEndDate(last);
      }
    }
  }, [timeRange, historicalData, customStartDate, customEndDate]);

  // Filtrar datos según el rango de tiempo y cantidad de registros
  const filteredResult = useMemo(() => {
    if (!historicalData || historicalData.length === 0) {
      return {
        data: [] as HistoricalDataPoint[],
        matchedCount: 0,
        totalCount: 0,
        reason: "no-data" as EmptyStateReason,
      };
    }

    let filtered = [...historicalData];

    if (timeRange === "custom") {
      const firstPoint = parseTimestamp(historicalData[0].timestamp);
      const lastPoint = parseTimestamp(
        historicalData[historicalData.length - 1].timestamp
      );

      const startDate = customStartDate
        ? parseTimestamp(customStartDate)
        : firstPoint;
      const endDate = customEndDate ? parseTimestamp(customEndDate) : lastPoint;

      if (!startDate || !endDate) {
        return {
          data: [],
          matchedCount: 0,
          totalCount: historicalData.length,
          reason: "missing-custom" as EmptyStateReason,
        };
      }

      if (startDate > endDate) {
        return {
          data: [],
          matchedCount: 0,
          totalCount: historicalData.length,
          reason: "invalid-range" as EmptyStateReason,
        };
      }

      const inclusiveEnd = new Date(endDate.getTime() + 59 * 1000 + 999);

      filtered = filtered.filter((point) => {
        const pointDate = parseTimestamp(point.timestamp);
        if (!pointDate) return false;
        return pointDate >= startDate && pointDate <= inclusiveEnd;
      });
    } else {
      const now = new Date();
      let startTime = new Date(now);

      switch (timeRange) {
        case "1h":
          startTime = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case "6h":
          startTime = new Date(now.getTime() - 6 * 60 * 60 * 1000);
          break;
        case "24h":
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7d":
          startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      filtered = filtered.filter((point) => {
        const pointDate = parseTimestamp(point.timestamp);
        if (!pointDate) return false;
        return pointDate >= startTime;
      });
    }

    const matchedCount = filtered.length;

    if (matchedCount === 0) {
      return {
        data: [] as HistoricalDataPoint[],
        matchedCount: 0,
        totalCount: historicalData.length,
        reason: "no-match" as EmptyStateReason,
      };
    }

    const limit = Number.parseInt(dataLimit, 10);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? limit : 20;
    const limited = filtered.slice(-safeLimit);

    return {
      data: limited,
      matchedCount,
      totalCount: historicalData.length,
      reason: null as EmptyStateReason | null,
    };
  }, [historicalData, timeRange, customStartDate, customEndDate, dataLimit]);

  const {
    data: limitedData,
    matchedCount,
    reason: emptyStateReason,
  } = filteredResult;

  // Preparar datos para gráficos
  const chartData = useMemo(() => {
    return limitedData.map((point) => {
      const pointDate = new Date(point.timestamp);

      // Mostrar fecha y hora para rangos largos, solo hora para rangos cortos
      const showDate =
        timeRange === "7d" || timeRange === "30d" || timeRange === "custom";

      // Formato de hora en Costa Rica (America/Costa_Rica timezone)
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Costa_Rica",
      };

      const dateTimeOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Costa_Rica",
      };

      const dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        timeZone: "America/Costa_Rica",
      };

      return {
        time: showDate
          ? pointDate.toLocaleString("es-ES", dateTimeOptions)
          : pointDate.toLocaleTimeString("es-ES", timeOptions),
        date: pointDate.toLocaleDateString("es-ES", dateOptions),
        timestamp: point.timestamp,
        temperatura: point.temperatura_celsius,
        humedad: point.humedad_pct,
        co2: point.co2_ppm,
        luz: point.lux,
        humedad_suelo: point.humedad_suelo,
        presion: point.presion_hpa,
        indice_uv: point.indice_uv,
        temperatura_suelo: point.temperatura_suelo_celsius,
      };
    });
  }, [limitedData, timeRange]);

  // Configuración de gráficos individuales
  const individualMetrics = [
    {
      key: "temperatura",
      label: "Temperatura",
      icon: Thermometer,
      color: "bg-white",
      iconColor: "text-red-600",
      chartColor: "#EF4444",
      unit: "°C",
      description:
        "Temperatura ambiente registrada por los sensores del robot (grados Celsius).",
      min: 0,
      max: 40,
    },
    {
      key: "presion",
      label: "Presión",
      icon: Wind,
      color: "bg-white",
      iconColor: "text-purple-600",
      chartColor: "#8B5CF6",
      unit: "hPa",
      description:
        "Presión atmosférica medida a la altura del cultivo (hectopascales).",
      min: 0,
      max: 1000,
    },
    {
      key: "humedad",
      label: "Humedad",
      icon: Droplets,
      color: "bg-white",
      iconColor: "text-blue-600",
      chartColor: "#3B82F6",
      unit: "%",
      description:
        "Humedad relativa del aire detectada por el robot (porcentaje).",
      min: 0,
      max: 100,
    },
    {
      key: "co2",
      label: "CO2",
      icon: Activity,
      color: "bg-white",
      iconColor: "text-gray-600",
      chartColor: "#6B7280",
      unit: "ppm",
      description:
        "Concentración de dióxido de carbono en la zona del cultivo (partes por millón).",
      min: 0,
      max: 400,
    },
    {
      key: "luz",
      label: "Luz",
      icon: Sun,
      color: "bg-white",
      iconColor: "text-yellow-600",
      chartColor: "#F59E0B",
      unit: "lux",
      description:
        "Nivel de iluminación ambiental registrado por el sensor de luz (lux).",
      min: 0,
      max: 1000,
    },
    {
      key: "indice_uv",
      label: "Índice UV",
      icon: Sun,
      color: "bg-white",
      iconColor: "text-orange-600",
      chartColor: "#F97316",
      unit: "UV",
      description:
        "Índice ultravioleta estimado en la superficie del cultivo (valor UV).",
      min: 0,
      max: 3,
    },
    {
      key: "humedad_suelo",
      label: "Humedad Suelo",
      icon: Activity,
      color: "bg-white",
      iconColor: "text-green-600",
      chartColor: "#10B981",
      unit: "adc",
      description:
        "Lectura de humedad del suelo a nivel radicular (valor analógico del sensor).",
      min: 200,
      max: 600,
    },
    {
      key: "temperatura_suelo",
      label: "Temp. Suelo",
      icon: Thermometer,
      color: "bg-white",
      iconColor: "text-amber-600",
      chartColor: "#F59E0B",
      unit: "°C",
      description:
        "Temperatura del suelo en la zona de raíces (grados Celsius).",
      min: 10,
      max: 40,
    },
  ];

  const renderEmptyState = (reason: EmptyStateReason | null) => {
    const resolvedReason: EmptyStateReason =
      reason ?? (historicalData.length === 0 ? "no-data" : "no-match");

    if (resolvedReason === "missing-custom") {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center space-y-2">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-slate-400" />
            <p className="text-lg font-medium">
              Selecciona un rango de fechas
            </p>
            <p className="text-sm">
              Define la fecha de inicio y de fin para aplicar el filtro
              personalizado.
            </p>
            <p className="text-xs text-slate-400">
              Ambos campos son obligatorios. Usa el selector de fechas sobre los
              gráficos.
            </p>
          </div>
        </div>
      );
    }

    if (resolvedReason === "invalid-range") {
      return (
        <div className="flex items-center justify-center h-64 text-slate-500">
          <div className="text-center space-y-2">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 text-amber-500" />
            <p className="text-lg font-medium">
              Rango de fechas no válido
            </p>
            <p className="text-sm">
              La fecha de inicio debe ser anterior a la fecha de fin. Ajusta el
              rango e inténtalo de nuevo.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        <div className="text-center">
          <Database className="h-12 w-12 mx-auto mb-2 text-slate-400" />
          <p className="text-lg font-medium">
            {resolvedReason === "no-data"
              ? "Este robot aún no tiene lecturas históricas"
              : "No hay lecturas para el filtro seleccionado"}
          </p>
          <p className="text-sm mb-3">
            {resolvedReason === "no-data"
              ? "Genera nuevos registros o sincroniza el robot para comenzar a visualizar métricas."
              : "Prueba ampliando el rango de fechas o ajustando la cantidad de registros."}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setTimeRange("24h")}
              className="text-xs"
            >
              Usar últimas 24h
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDataLimit("200")}
              className="text-xs"
            >
              Mostrar 200 datos
            </Button>
            {onGenerateRecord && (
              <Button
                size="sm"
                onClick={onGenerateRecord}
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                style={{ backgroundColor: "#0057a3" }}
              >
                Generar datos
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderIndividualChart = (metric: any) => {
    if (chartData.length === 0) {
      return renderEmptyState(emptyStateReason);
    }

    const commonProps = {
      data: chartData,
      margin: { top: 10, right: 20, left: 10, bottom: 10 },
    };

    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
            <p className="font-medium text-slate-900 mb-3">{label}</p>
            <div className="flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.chartColor }}
                />
                <span className="text-sm font-medium text-slate-700">
                  {metric.label}:
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-900">
                {payload[0].value.toFixed(1)} {metric.unit}
              </span>
            </div>
          </div>
        );
      }
      return null;
    };

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[metric.min || "auto", metric.max || "auto"]}
                label={{
                  value: metric.unit || "Valores",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey={metric.key}
                stroke={metric.chartColor}
                strokeWidth={3}
                name={metric.label}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[metric.min || "auto", metric.max || "auto"]}
                label={{
                  value: metric.unit || "Valores",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar
                dataKey={metric.key}
                fill={metric.chartColor}
                radius={[4, 4, 0, 0]}
                name={metric.label}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
                domain={[metric.min || "auto", metric.max || "auto"]}
                label={{
                  value: metric.unit || "Valores",
                  angle: -90,
                  position: "insideLeft",
                  style: { textAnchor: "middle" },
                }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={metric.key}
                stroke={metric.chartColor}
                fill={metric.chartColor}
                fillOpacity={0.3}
                name={metric.label}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
      className={`space-y-4 sm:space-y-6 ${
        isFullscreen ? "fixed inset-0 z-50 bg-white p-4 sm:p-6 overflow-auto" : ""
      }`}
    >
      {/* Controles */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 sm:gap-4 p-2 sm:p-3 bg-white rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto overflow-x-auto">
          {/* Rango de tiempo */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-xs sm:text-sm font-medium text-slate-600">Período:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                { value: "1h", label: "1h" },
                { value: "6h", label: "6h" },
                { value: "24h", label: "24h" },
                { value: "7d", label: "7d" },
                { value: "30d", label: "30d" },
                { value: "custom", label: "Personalizado" },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={timeRange === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeRange(value as any)}
                  className="h-7 px-2 text-xs font-medium"
                  style={
                    timeRange === value ? { backgroundColor: "#0057a3" } : {}
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Fechas personalizadas */}
          {timeRange === "custom" && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <Calendar className="h-4 w-4 text-slate-500" />
              <input
                type="datetime-local"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="h-7 px-2 text-xs border border-slate-300 rounded-md w-full sm:w-auto"
                placeholder="Fecha inicio"
              />
              <span className="text-xs text-slate-500">a</span>
              <input
                type="datetime-local"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="h-7 px-2 text-xs border border-slate-300 rounded-md w-full sm:w-auto"
                placeholder="Fecha fin"
              />
            </div>
          )}

          {/* Cantidad de registros */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-slate-500" />
              <span className="text-xs sm:text-sm font-medium text-slate-600">
                Registros:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {["20", "50", "100", "200"].map((limit) => (
                <Button
                  key={limit}
                  variant={dataLimit === limit ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDataLimit(limit as any)}
                  className="h-7 px-2 text-xs font-medium"
                  style={
                    dataLimit === limit ? { backgroundColor: "#4caf50" } : {}
                  }
                >
                  {limit}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full lg:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="text-xs sm:text-sm font-medium text-slate-700">
                Tipo de gráfico:
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {[
                {
                  type: "line",
                  label: "Línea",
                  icon: <TrendingUp className="h-3 w-3" />,
                },
                {
                  type: "bar",
                  label: "Barras",
                  icon: <BarChart3 className="h-3 w-3" />,
                },
                {
                  type: "area",
                  label: "Área",
                  icon: <Activity className="h-3 w-3" />,
                },
              ].map(({ type, label, icon }) => (
                <Button
                  key={type}
                  variant={chartType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType(type as any)}
                  className="h-7 px-2 text-xs font-medium flex items-center space-x-1"
                  style={
                    chartType === type ? { backgroundColor: "#0057a3" } : {}
                  }
                >
                  {icon}
                  <span>{label}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 sm:h-8 px-2 sm:px-3"
            >
              {isFullscreen ? (
                <Minimize2 className="h-3 w-3" />
              ) : (
                <Maximize2 className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="h-7 sm:h-8 px-2 sm:px-3"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Información del rango seleccionado */}
      <div className="bg-slate-50 rounded-lg p-2 sm:p-3 border border-slate-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Clock className="h-4 w-4 text-slate-600" />
            <span className="text-sm font-medium text-slate-700">
              Mostrando datos de:
            </span>
            <Badge variant="outline" className="text-xs">
              {timeRange === "custom"
                ? `${
                    customStartDate
                      ? new Date(customStartDate).toLocaleDateString("es-ES", {
                          timeZone: "America/Costa_Rica",
                        })
                      : "Inicio"
                  } - ${
                    customEndDate
                      ? new Date(customEndDate).toLocaleDateString("es-ES", {
                          timeZone: "America/Costa_Rica",
                        })
                      : "Fin"
                  }`
                : timeRange === "1h"
                ? "Última hora"
                : timeRange === "6h"
                ? "Últimas 6 horas"
                : timeRange === "24h"
                ? "Últimas 24 horas"
                : timeRange === "7d"
                ? "Últimos 7 días"
                : timeRange === "30d"
                ? "Últimos 30 días"
                : "Período personalizado"}
            </Badge>
          </div>
          <div className="text-xs text-slate-500">
            {matchedCount === 0
              ? "Sin registros para este filtro"
              : `${limitedData.length} de ${matchedCount} registros mostrados`}
          </div>
        </div>
      </div>

      {/* Gráficos individuales por métrica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {individualMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card
              key={index}
              className={`${metric.color} border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 rounded-lg`}
            >
              <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-4 pt-3 sm:pt-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-700">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 cursor-help">
                        <div className="p-1.5 rounded-md bg-slate-100">
                          <IconComponent
                            className={`h-4 w-4 ${metric.iconColor}`}
                          />
                        </div>
                        <span>{metric.label}</span>
                        <Info className="h-3.5 w-3.5 text-slate-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-slate-900 text-white">
                      <p className="text-xs font-semibold">{metric.label}</p>
                      <p className="text-xs mt-1 leading-relaxed">
                        {metric.description}
                      </p>
                      <p className="text-[10px] mt-2 opacity-70 uppercase tracking-wide">
                        Unidad: {metric.unit}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full px-3 sm:px-4 pb-3 sm:pb-4">
                <div className="h-auto">{renderIndividualChart(metric)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Datos climáticos satelitales */}
      {sensorData?.climate && (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            Datos Climáticos Satelitales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* 🌡️ Temperaturas */}
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Thermometer className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Temp. 2m</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.temperatura_2m?.toFixed(1) ?? "N/A"}°C
              </p>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Maximize2 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Temp. Máx.</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.temperatura_maxima?.toFixed(1) ?? "N/A"}°C
              </p>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Minimize2 className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Temp. Mín.</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.temperatura_minima?.toFixed(1) ?? "N/A"}°C
              </p>
            </div>

            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Rango Temp.</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.rango_temperatura?.toFixed(1) ?? "N/A"}°C
              </p>
            </div>

            {/* 💧 Humedad */}
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Droplets className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Humedad Relativa</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.humedad_relativa?.toFixed(1) ?? "N/A"}%
              </p>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Droplets className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Humedad Específica</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.humedad_especifica?.toFixed(3) ?? "N/A"} kg/kg
              </p>
            </div>

            {/* 💨 Viento */}
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Wind className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Vel. Viento</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.velocidad_viento?.toFixed(1) ?? "N/A"} m/s
              </p>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Maximize2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Vel. Máx. Viento</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.velocidad_viento_max?.toFixed(1) ?? "N/A"} m/s
              </p>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Minimize2 className="h-5 w-5 text-green-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Vel. Mín. Viento</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.velocidad_viento_min?.toFixed(1) ?? "N/A"} m/s
              </p>
            </div>

            {/* ☀️ Radiación */}
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Rad. Onda Corta</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.radiacion_onda_corta?.toFixed(0) ?? "N/A"} W/m²
              </p>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Rad. Onda Larga</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.radiacion_onda_larga?.toFixed(0) ?? "N/A"} W/m²
              </p>
            </div>

            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <Sun className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Cielo Despejado</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.radiacion_cielo_despejado?.toFixed(0) ?? "N/A"} W/m²
              </p>
            </div>

            {/* 🌧️ Precipitación y otros */}
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Droplets className="h-5 w-5 text-purple-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Precipitación</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.precipitacion_corregida?.toFixed(1) ?? "N/A"} mm
              </p>
            </div>

            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Presión Superficie</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.presion_superficie?.toFixed(1) ?? "N/A"} hPa
              </p>
            </div>

            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <Activity className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Evaporación</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.evaporacion?.toFixed(1) ?? "N/A"} mm
              </p>
            </div>

            <div className="text-center p-3 bg-cyan-50 rounded-lg">
              <TrendingUp className="h-5 w-5 text-cyan-600 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Índice Claridad</p>
              <p className="text-lg font-bold text-slate-900">
                {sensorData.climate.indice_claridad?.toFixed(2) ?? "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      )}


      {/* Spacing adicional al final */}
      <div className="h-8"></div>
      </div>
    </TooltipProvider>
  );
}
