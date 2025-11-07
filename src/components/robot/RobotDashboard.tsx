"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  RefreshCw,
  MapPin,
  Activity,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  Database,
  Clock,
  TrendingUp,
  Eye,
  AlertTriangle,
  CheckCircle,
  Zap,
  Wind,
  Gauge,
  Target,
  BarChart3,
  Settings,
  Download,
  Share2,
  Grid3X3,
  Layout,
  GripVertical,
  Maximize2,
  Minimize2,
  Trash2,
  Plus,
  RotateCcw,
  Leaf,
  Satellite,
} from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { RobotStats } from "@/lib/types";
import {
  SensorData,
  RobotData,
  getCurrentSensorData,
  getHistoricalSensorData,
  getRealtimeSensorData,
  getAdvancedSensorStats,
  getRobotData,
} from "@/actions/sensors";
import RobotCharts from "./RobotCharts";
import RobotMap from "./RobotMap";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import SimpleDragDropDashboard from "./SimpleDragDropDashboard";

// Tipos de widgets disponibles
export type WidgetType =
  | "map"
  | "chart"
  | "metrics"
  | "sensors"
  | "weather"
  | "temperature"
  | "humidity"
  | "pressure";

interface RobotDashboardProps {
  robot: RobotStats;
  onRefresh: () => void;
  onGenerateRecord: () => void;
  onBack: () => void;
  loading: boolean;
  refreshing?: boolean;
}

export default function RobotDashboard({
  robot,
  onRefresh,
  onGenerateRecord,
  onBack,
  loading,
  refreshing = false,
}: RobotDashboardProps) {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [robotData, setRobotData] = useState<RobotData | null>(null);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 60 segundos
  const [advancedStats, setAdvancedStats] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "error"
  >("connected");
  const [widgetOrder, setWidgetOrder] = useState<string[]>(["map", "chart"]);
  const [isDragMode, setIsDragMode] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Cargar orden de widgets guardado
  useEffect(() => {
    const savedOrder = localStorage.getItem(`robot-${robot.uuid}-widget-order`);
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        if (parsedOrder.length > 0) {
          setWidgetOrder(parsedOrder);
        }
      } catch (error) {
        console.error("Error loading saved widget order:", error);
      }
    }
  }, [robot.uuid]);

  // Guardar orden de widgets
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(
        `robot-${robot.uuid}-widget-order`,
        JSON.stringify(widgetOrder)
      );
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [widgetOrder, robot.uuid]);

  useEffect(() => {
    // Solo cargar datos una vez al montar el componente
    loadRobotData();
    loadSensorData();
    loadAdvancedStats();
  }, [robot.uuid]);

  const loadRobotData = useCallback(async () => {
    if (!robot.uuid) return;

    try {
      const result = await getRobotData(robot.uuid);
      if (result.success && result.data) {
        setRobotData(result.data);
      }
    } catch (error) {
      console.error("Error loading robot data:", error);
    }
  }, [robot.uuid]);

  const loadSensorData = useCallback(async () => {
    if (!robot.uuid) return;

    setDataLoading(true);
    setConnectionStatus("connected");

    try {
      const [currentResult, historicalResult] = await Promise.all([
        getRealtimeSensorData(robot.uuid),
        getHistoricalSensorData(robot.uuid, 168), // 7 días = 168 horas
      ]);

      if (currentResult.success && currentResult.data) {
        setSensorData(currentResult.data);
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("error");
      }

      if (historicalResult.success && historicalResult.data) {
        setHistoricalData(historicalResult.data);
      }
    } catch (error) {
      console.error("Error loading sensor data:", error);
      setConnectionStatus("error");
    } finally {
      setDataLoading(false);
    }
  }, [robot.uuid]);

  const loadAdvancedStats = useCallback(async () => {
    if (!robot.uuid) return;

    try {
      const result = await getAdvancedSensorStats(robot.uuid, 168); // 7 días
      if (result.success && result.stats) {
        setAdvancedStats(result.stats);
      }
    } catch (error) {
      console.error("Error loading advanced stats:", error);
    }
  }, [robot.uuid]);

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-200";
      case "inactivo":
        return "bg-red-500/10 text-red-700 border-red-200";
      case "mantenimiento":
        return "bg-amber-500/10 text-amber-700 border-amber-200";
      default:
        return "bg-gray-500/10 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "activo":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "inactivo":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "mantenimiento":
        return <Settings className="h-4 w-4 text-amber-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatValue = (value: number, unit: string, decimals: number = 1) => {
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getHealthScore = () => {
    if (!sensorData) return 0;

    let score = 0;
    let factors = 0;

    // Temperatura (20-30°C es óptimo)
    if (sensorData.temperature?.temperatura_celsius) {
      const temp = sensorData.temperature.temperatura_celsius;
      if (temp >= 20 && temp <= 30) score += 25;
      else if (temp >= 15 && temp <= 35) score += 15;
      else score += 5;
      factors++;
    }

    // Humedad (40-70% es óptimo)
    if (sensorData.humidity?.humedad_pct) {
      const humidity = sensorData.humidity.humedad_pct;
      if (humidity >= 40 && humidity <= 70) score += 25;
      else if (humidity >= 30 && humidity <= 80) score += 15;
      else score += 5;
      factors++;
    }

    // CO2 (400-600 ppm es óptimo)
    if (sensorData.humidity?.co2_ppm) {
      const co2 = sensorData.humidity.co2_ppm;
      if (co2 >= 400 && co2 <= 600) score += 25;
      else if (co2 >= 300 && co2 <= 800) score += 15;
      else score += 5;
      factors++;
    }

    // Luz (500-1000 lux es óptimo)
    if (sensorData.light?.lux) {
      const light = sensorData.light.lux;
      if (light >= 500 && light <= 1000) score += 25;
      else if (light >= 200 && light <= 1500) score += 15;
      else score += 5;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  };

  const healthScore = getHealthScore();
  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    return "text-red-600";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 80) return "Excelente";
    if (score >= 60) return "Bueno";
    if (score >= 40) return "Regular";
    return "Crítico";
  };

  // Funciones de drag and drop
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgetOrder((items) => {
        const oldIndex = items.findIndex((item) => item === active.id);
        const newIndex = items.findIndex((item) => item === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  }, []);

  // Componente sortable para el mapa
  const SortableMap = () => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging,
    } = useSortable({ id: "map" });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isItemDragging ? 10 : 0,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group animate-fade-in-up transition-all duration-300"
      >
        <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <MapPin className="h-4 sm:h-6 w-4 sm:w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base sm:text-xl bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    Ubicación del Robot
                  </CardTitle>
                  <p className="text-slate-600 text-xs sm:text-sm hidden sm:block">
                    Visualización en tiempo real de la posición del robot
                  </p>
                </div>
              </div>
              {isDragMode && (
                <div className="flex items-center gap-2">
                  <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <GripVertical className="h-4 w-4 text-blue-500" />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setWidgetOrder(
                        widgetOrder.filter((item) => item !== "map")
                      );
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-64 sm:h-80 md:h-96 lg:h-[400px] rounded-xl overflow-hidden border border-white/30 shadow-inner bg-gradient-to-br from-blue-50 to-indigo-50">
              <RobotMap
                lat={robotData?.latitud ? Number(robotData.latitud) : 9.890044}
                lng={
                  robotData?.longitud ? Number(robotData.longitud) : -84.088523
                }
                robotName={robot.nombre}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Componente sortable para la gráfica
  const SortableChart = () => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging,
    } = useSortable({ id: "chart" });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isItemDragging ? 10 : 0,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group animate-fade-in-up transition-all duration-300"
      >
        <Card className="bg-white/90 backdrop-blur-sm border border-white/20 shadow-2xl rounded-2xl">
          <CardHeader className="pb-3 sm:pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <TrendingUp className="h-4 sm:h-5 w-4 sm:w-5" />
                  <span>Análisis de Datos</span>
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {isDragMode && (
                  <>
                    <div
                      {...attributes}
                      {...listeners}
                      className="cursor-grab active:cursor-grabbing p-2 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <GripVertical className="h-4 w-4 text-blue-500" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWidgetOrder(
                          widgetOrder.filter((item) => item !== "chart")
                        );
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const data = {
                      robot: robot.nombre,
                      timestamp: new Date().toISOString(),
                      sensorData: sensorData,
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `robot-${robot.nombre}-${
                      new Date().toISOString().split("T")[0]
                    }.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                  className="text-xs sm:text-sm"
                >
                  <Download className="h-3 sm:h-4 w-3 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Descargar</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `Datos del Robot ${robot.nombre}`,
                        text: `Datos de sensores del robot ${robot.nombre}`,
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Enlace copiado al portapapeles");
                    }
                  }}
                  className="text-xs sm:text-sm"
                >
                  <Share2 className="h-3 sm:h-4 w-3 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Compartir</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-6">
            <div className="h-auto w-full">
              <RobotCharts
                sensorData={sensorData}
                historicalData={historicalData}
                onGenerateRecord={onGenerateRecord}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Componentes para widgets pequeños
  const SmallWidget = ({ type, id }: { type: string; id: string }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging: isItemDragging,
    } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      zIndex: isItemDragging ? 10 : 0,
    };

    const getWidgetContent = () => {
      switch (type) {
        case "weather":
          return {
            icon: <Cloud className="h-6 w-6 text-blue-500" />,
            title: "Clima",
            value: "22°C",
            subtitle: "Parcialmente nublado",
            color: "bg-blue-50 border-blue-200",
            iconColor: "bg-blue-500",
          };
        case "temperature":
          return {
            icon: <Thermometer className="h-6 w-6 text-red-500" />,
            title: "Temperatura",
            value: sensorData?.temperature?.temperatura_celsius
              ? `${sensorData.temperature.temperatura_celsius.toFixed(1)}°C`
              : "N/A",
            subtitle: "Actual",
            color: "bg-red-50 border-red-200",
            iconColor: "bg-red-500",
          };
        case "humidity":
          return {
            icon: <Droplets className="h-6 w-6 text-cyan-500" />,
            title: "Humedad",
            value: sensorData?.humidity?.humedad_pct
              ? `${sensorData.humidity.humedad_pct.toFixed(1)}%`
              : "N/A",
            subtitle: "Relativa",
            color: "bg-cyan-50 border-cyan-200",
            iconColor: "bg-cyan-500",
          };
        case "pressure":
          return {
            icon: <Gauge className="h-6 w-6 text-emerald-500" />,
            title: "Presión",
            value: sensorData?.temperature?.presion_hpa
              ? `${sensorData.temperature.presion_hpa.toFixed(1)} hPa`
              : "N/A",
            subtitle: "Atmosférica",
            color: "bg-emerald-50 border-emerald-200",
            iconColor: "bg-emerald-500",
          };
        default:
          return {
            icon: <Activity className="h-6 w-6 text-gray-500" />,
            title: "Widget",
            value: "N/A",
            subtitle: "Sin datos",
            color: "bg-gray-50 border-gray-200",
            iconColor: "bg-gray-500",
          };
      }
    };

    const content = getWidgetContent();

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="group animate-bounce-in transition-all duration-300"
      >
        <Card
          className={`${content.color} border border-white/30 bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl`}
        >
          <CardContent className="p-4 h-full">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 ${content.iconColor} rounded-xl shadow-md`}
                  >
                    {content.icon}
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm">
                    {content.title}
                  </h4>
                </div>
                {isDragMode && (
                  <div className="flex items-center space-x-1">
                    <div
                      {...attributes}
                      {...listeners}
                      className="cursor-grab active:cursor-grabbing p-1 rounded-lg transition-colors"
                    >
                      <GripVertical className="h-3 w-3 text-slate-500" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWidgetOrder(
                          widgetOrder.filter((item) => item !== id)
                        );
                      }}
                      className="text-red-500 h-6 w-6 p-0 rounded-lg"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center text-center">
                <p className="text-3xl font-bold text-slate-900 mb-2">
                  {content.value}
                </p>
                <p className="text-sm text-slate-600 font-medium">
                  {content.subtitle}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Función para renderizar elementos ordenados
  const renderOrderedElements = useMemo(() => {
    const largeWidgets = widgetOrder.filter(
      (type) => type === "map" || type === "chart"
    );
    const smallWidgets = widgetOrder.filter((type) =>
      ["weather", "temperature", "humidity", "pressure"].includes(
        type
      )
    );

    return (
      <>
        {/* Widgets grandes */}
        {largeWidgets.map((type) => {
          switch (type) {
            case "map":
              return <SortableMap key="map" />;
            case "chart":
              return <SortableChart key="chart" />;
            default:
              return null;
          }
        })}

        {/* Widgets pequeños en grid */}
        {smallWidgets.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-6 sm:pb-8">
            {smallWidgets.map((type) => (
              <SmallWidget key={type} type={type} id={type} />
            ))}
          </div>
        )}
      </>
    );
  }, [widgetOrder, isDragMode, sensorData, historicalData, robot]);

  return (
    <div id="widget-selector" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Simplificado */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center space-x-1 sm:space-x-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Volver</span>
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center space-x-2">
                <span>{robot.nombre}</span>
                {refreshing && (
                  <div className="animate-spin">
                    <RefreshCw className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                  </div>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-600">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Database className="h-3 sm:h-4 w-3 sm:w-4 text-blue-600" />
                  <span className="font-medium">
                    {robot.total_registros || 0} registros
                  </span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Activity className="h-3 sm:h-4 w-3 sm:w-4 text-green-600" />
                  <span className="font-medium">
                    {robot.registros_hoy || 0} hoy
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  loadRobotData();
                  loadSensorData();
                  loadAdvancedStats();
                }}
                disabled={dataLoading}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <RefreshCw
                  className={`h-3 sm:h-4 w-3 sm:w-4 ${dataLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowAddWidget((prev) => {
                    const newState = !prev;
                    if (!prev) {
                      // Espera al render del menú y luego hace scroll suave
                      setTimeout(() => {
                        document
                          .getElementById("widget-selector")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }
                    return newState;
                  });
                }}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <Plus className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">Agregar</span>
              </Button>
              <Button
                variant={isDragMode ? "default" : "outline"}
                size="sm"
                onClick={() => setIsDragMode(!isDragMode)}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <GripVertical className="h-3 sm:h-4 w-3 sm:w-4" />
                <span className="hidden sm:inline">{isDragMode ? "Salir" : "Reorganizar"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Widget Selector */}
      {showAddWidget && (
        <div className="bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-slate-800">
                Agregar Componente
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddWidget(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                ✕
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Widgets grandes */}
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  widgetOrder.includes("map")
                    ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
                }`}
                onClick={() => {
                  if (!widgetOrder.includes("map")) {
                    setWidgetOrder([...widgetOrder, "map"]);
                    setShowAddWidget(false);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Mapa del Robot
                    </h4>
                    <p className="text-sm text-slate-600">
                      Ubicación en tiempo real
                    </p>
                  </div>
                </div>
              </div>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  widgetOrder.includes("chart")
                    ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100"
                }`}
                onClick={() => {
                  if (!widgetOrder.includes("chart")) {
                    setWidgetOrder([...widgetOrder, "chart"]);
                    setShowAddWidget(false);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800">
                      Gráfico de Datos
                    </h4>
                    <p className="text-sm text-slate-600">
                      Análisis de sensores
                    </p>
                  </div>
                </div>
              </div>

              {/* Widgets pequeños */}
              <div
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  widgetOrder.includes("weather")
                    ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-blue-200 bg-blue-50 hover:border-blue-300 hover:bg-blue-100"
                }`}
                onClick={() => {
                  if (!widgetOrder.includes("weather")) {
                    setWidgetOrder([...widgetOrder, "weather"]);
                    setShowAddWidget(false);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <Cloud className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">
                      Clima
                    </h4>
                    <p className="text-xs text-slate-600">Widget pequeño</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  widgetOrder.includes("temperature")
                    ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100"
                }`}
                onClick={() => {
                  if (!widgetOrder.includes("temperature")) {
                    setWidgetOrder([...widgetOrder, "temperature"]);
                    setShowAddWidget(false);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <Thermometer className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">
                      Temperatura
                    </h4>
                    <p className="text-xs text-slate-600">Widget pequeño</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  widgetOrder.includes("humidity")
                    ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-cyan-200 bg-cyan-50 hover:border-cyan-300 hover:bg-cyan-100"
                }`}
                onClick={() => {
                  if (!widgetOrder.includes("humidity")) {
                    setWidgetOrder([...widgetOrder, "humidity"]);
                    setShowAddWidget(false);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <Droplets className="h-5 w-5 text-cyan-500" />
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">
                      Humedad
                    </h4>
                    <p className="text-xs text-slate-600">Widget pequeño</p>
                  </div>
                </div>
              </div>

              <div
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  widgetOrder.includes("pressure")
                    ? "border-gray-300 bg-gray-50 opacity-50 cursor-not-allowed"
                    : "border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100"
                }`}
                onClick={() => {
                  if (!widgetOrder.includes("pressure")) {
                    setWidgetOrder([...widgetOrder, "pressure"]);
                    setShowAddWidget(false);
                  }
                }}
              >
                <div className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-emerald-500" />
                  <div>
                    <h4 className="font-medium text-slate-800 text-sm">
                      Presión
                    </h4>
                    <p className="text-xs text-slate-600">Widget pequeño</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Content */}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
        {/* Grid Background Animation */}
        <div className="hidden md:block fixed inset-0 opacity-5 pointer-events-none z-0">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "40px 40px",
              animation: "gridMove 20s linear infinite",
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-8 sm:pb-12 z-10">
          {isDragMode ? (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-xl animate-bounce-in">
              <div className="flex items-center space-x-3 text-blue-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <GripVertical className="h-5 w-5" />
                </div>
                <span className="font-semibold">Modo Reorganización</span>
              </div>
              <p className="text-sm text-blue-600 mt-2 ml-11">
                Arrastra los componentes para reorganizar el dashboard
              </p>
            </div>
          ) : null}

          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={widgetOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-6">{renderOrderedElements}</div>
            </SortableContext>

            <DragOverlay>
              {activeId ? (
                <div className="drag-preview opacity-90 scale-110">
                  {activeId === "map" && (
                    <div className="w-96 h-64 bg-blue-100 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-blue-700">
                          Mapa del Robot
                        </p>
                      </div>
                    </div>
                  )}
                  {activeId === "chart" && (
                    <div className="w-96 h-64 bg-green-100 rounded-lg border-2 border-green-300 flex items-center justify-center">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-medium text-green-700">
                          Gráfico de Datos
                        </p>
                      </div>
                    </div>
                  )}
                  {/* Widgets pequeños */}
                  {activeId === "weather" && (
                    <div className="w-48 h-24 bg-blue-100 rounded-lg border-2 border-blue-300 flex items-center justify-center">
                      <div className="text-center">
                        <Cloud className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs font-medium text-blue-700">
                          Clima
                        </p>
                      </div>
                    </div>
                  )}
                  {activeId === "temperature" && (
                    <div className="w-48 h-24 bg-red-100 rounded-lg border-2 border-red-300 flex items-center justify-center">
                      <div className="text-center">
                        <Thermometer className="h-6 w-6 text-red-500 mx-auto mb-1" />
                        <p className="text-xs font-medium text-red-700">
                          Temperatura
                        </p>
                      </div>
                    </div>
                  )}
                  {activeId === "humidity" && (
                    <div className="w-48 h-24 bg-cyan-100 rounded-lg border-2 border-cyan-300 flex items-center justify-center">
                      <div className="text-center">
                        <Droplets className="h-6 w-6 text-cyan-500 mx-auto mb-1" />
                        <p className="text-xs font-medium text-cyan-700">
                          Humedad
                        </p>
                      </div>
                    </div>
                  )}
                  {activeId === "pressure" && (
                    <div className="w-48 h-24 bg-emerald-100 rounded-lg border-2 border-emerald-300 flex items-center justify-center">
                      <div className="text-center">
                        <Gauge className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs font-medium text-emerald-700">
                          Presión
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

// Estilos CSS para las animaciones
const styles = `
  @keyframes gridMove {
    0% { transform: translate(0, 0); }
    100% { transform: translate(40px, 40px); }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes dragHover {
    0% {
      transform: scale(1);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    100% {
      transform: scale(1.02);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out;
  }
  
  .animate-scale-in {
    animation: scaleIn 0.6s ease-out;
  }
  
  .animate-slide-in-left {
    animation: slideInFromLeft 0.7s ease-out;
  }
  
  .animate-bounce-in {
    animation: bounceIn 0.8s ease-out;
  }
  
  .animate-drag-hover {
    animation: dragHover 0.3s ease-out;
  }
  
  .drag-preview {
    transform: rotate(5deg);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    border: 2px solid rgba(59, 130, 246, 0.3);
  }
`;

// Inyectar estilos
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
