"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CloudDrizzle, Thermometer, Sun, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateYieldImpact, seededRandom } from "@/lib/weatherUtils";

interface WeatherSimulatorProps {
  region: string;
  crop: string;
  startDate: Date | undefined;
}

export default function WeatherSimulator({ region, crop, startDate }: WeatherSimulatorProps) {
  const [scenario, setScenario] = useState("normal");
  const [tempAdjustment, setTempAdjustment] = useState([0]);
  const [precipAdjustment, setPrecipAdjustment] = useState([0]);
  const [simulationDays, setSimulationDays] = useState([14]);

  // Generate simulated data based on parameters
  const simulationData = useMemo(() => {
    if (!region || !startDate) return [];

    const data = [];
    const baseTemp = region === "norte" ? 28 : region === "sur" ? 18 : 23;
    const days = simulationDays[0];
    
    // Scenario modifiers
    const scenarioMods = {
      normal: { temp: 0, precip: 0, variance: 1 },
      sequia: { temp: 3, precip: -8, variance: 0.5 },
      lluvia: { temp: -2, precip: 12, variance: 1.5 },
      calor: { temp: 5, precip: -3, variance: 1.2 },
    };

    const mod = scenarioMods[scenario as keyof typeof scenarioMods] || scenarioMods.normal;
    
    // Use date as seed for deterministic variation
    const seed = startDate.getDate() + startDate.getMonth() * 31;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      const tempVariation = Math.sin(i / 3) * 2 * mod.variance;
      const precipVariation = seededRandom(seed, i) * 10 * mod.variance;
      
      const currentTemp = baseTemp + tempAdjustment[0] + mod.temp + tempVariation;
      const currentPrecip = Math.max(0, 5 + precipAdjustment[0] + mod.precip + precipVariation);
      
      data.push({
        date: date.toLocaleDateString('es-ES', { 
          day: 'numeric', 
          month: 'short',
          timeZone: 'America/Costa_Rica'
        }),
        temperatura: currentTemp,
        precipitacion: currentPrecip,
        rendimiento: calculateYieldImpact(currentTemp, currentPrecip, crop),
      });
    }
    
    return data;
  }, [region, crop, startDate, scenario, tempAdjustment, precipAdjustment, simulationDays]);

  const averageYield = useMemo(() => {
    if (simulationData.length === 0) return 0;
    return simulationData.reduce((acc, d) => acc + d.rendimiento, 0) / simulationData.length;
  }, [simulationData]);

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Simulation Parameters */}
      <div className="md:col-span-1 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5" />
              Parámetros de Simulación
            </CardTitle>
            <CardDescription>
              Ajusta los parámetros para simular diferentes escenarios climáticos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Scenario Selection */}
            <div className="space-y-2">
              <Label htmlFor="scenario">Escenario Climático</Label>
              <Select value={scenario} onValueChange={setScenario}>
                <SelectTrigger id="scenario">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="sequia">Sequía</SelectItem>
                  <SelectItem value="lluvia">Lluvioso</SelectItem>
                  <SelectItem value="calor">Ola de Calor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Temperature Adjustment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ajuste de Temperatura</Label>
                <span className="text-sm font-medium">{tempAdjustment[0] > 0 ? '+' : ''}{tempAdjustment[0]}°C</span>
              </div>
              <Slider
                value={tempAdjustment}
                onValueChange={setTempAdjustment}
                min={-10}
                max={10}
                step={0.5}
                className="w-full"
              />
            </div>

            {/* Precipitation Adjustment */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Ajuste de Precipitación</Label>
                <span className="text-sm font-medium">{precipAdjustment[0] > 0 ? '+' : ''}{precipAdjustment[0]}mm</span>
              </div>
              <Slider
                value={precipAdjustment}
                onValueChange={setPrecipAdjustment}
                min={-20}
                max={20}
                step={1}
                className="w-full"
              />
            </div>

            {/* Simulation Days */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Días a Simular</Label>
                <span className="text-sm font-medium">{simulationDays[0]} días</span>
              </div>
              <Slider
                value={simulationDays}
                onValueChange={setSimulationDays}
                min={7}
                max={30}
                step={1}
                className="w-full"
              />
            </div>

            {/* Reset Button */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setScenario("normal");
                setTempAdjustment([0]);
                setPrecipAdjustment([0]);
                setSimulationDays([14]);
              }}
            >
              Restablecer Valores
            </Button>
          </CardContent>
        </Card>

        {/* Yield Impact Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Impacto en Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-4xl font-bold ${
                averageYield > 80 ? 'text-green-500' : averageYield > 60 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {averageYield.toFixed(1)}%
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {averageYield > 80 ? 'Óptimo' : averageYield > 60 ? 'Moderado' : 'Bajo'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simulation Results */}
      <div className="md:col-span-2 space-y-6">
        {/* Temperature and Precipitation Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Simulación Climática
            </CardTitle>
            <CardDescription>
              Temperatura y precipitación simuladas para {simulationDays[0]} días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="temperatura" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Temperatura (°C)"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="precipitacion" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Precipitación (mm)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Yield Impact Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudDrizzle className="h-5 w-5" />
              Impacto en el Rendimiento del Cultivo
            </CardTitle>
            <CardDescription>
              Rendimiento esperado basado en condiciones climáticas simuladas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="rendimiento" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Rendimiento (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle>Recomendaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {averageYield < 60 && (
                <li className="flex items-start gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>El rendimiento esperado es bajo. Considera ajustar las fechas de siembra o implementar sistemas de riego.</span>
                </li>
              )}
              {scenario === "sequia" && (
                <li className="flex items-start gap-2 text-orange-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>En condiciones de sequía, es crítico implementar sistemas de riego eficientes y mulching para conservar humedad.</span>
                </li>
              )}
              {scenario === "lluvia" && (
                <li className="flex items-start gap-2 text-blue-600">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Alta precipitación puede causar enfermedades fúngicas. Asegura buen drenaje y monitorea plagas.</span>
                </li>
              )}
              {averageYield >= 80 && (
                <li className="flex items-start gap-2 text-green-600">
                  <Sun className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Las condiciones son óptimas para el cultivo. Mantén las prácticas actuales de manejo.</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
