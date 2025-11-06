"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WeatherForm from "./WeatherForm";
import WeatherForecast from "./WeatherForecast";
import WeatherSimulator from "./WeatherSimulator";

export default function WeatherClient() {
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          Pronóstico y Simulador de Clima
        </h1>
        <p className="text-gray-600">
          Consulta pronósticos climáticos y simula escenarios para optimizar tus decisiones agrícolas
        </p>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="forecast" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="forecast">Pronóstico</TabsTrigger>
          <TabsTrigger value="simulator">Simulador</TabsTrigger>
        </TabsList>

        {/* Forecast Tab */}
        <TabsContent value="forecast" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Parameters Form */}
            <div className="md:col-span-1">
              <WeatherForm
                selectedRegion={selectedRegion}
                setSelectedRegion={setSelectedRegion}
                selectedCrop={selectedCrop}
                setSelectedCrop={setSelectedCrop}
                startDate={startDate}
                setStartDate={setStartDate}
              />
            </div>

            {/* Forecast Display */}
            <div className="md:col-span-2">
              <WeatherForecast
                region={selectedRegion}
                crop={selectedCrop}
                startDate={startDate}
              />
            </div>
          </div>
        </TabsContent>

        {/* Simulator Tab */}
        <TabsContent value="simulator" className="space-y-6">
          <WeatherSimulator
            region={selectedRegion}
            crop={selectedCrop}
            startDate={startDate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
