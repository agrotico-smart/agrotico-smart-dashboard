"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { MapPin, Sprout, CalendarIcon } from "lucide-react";

interface WeatherFormProps {
  selectedRegion: string;
  setSelectedRegion: (value: string) => void;
  selectedCrop: string;
  setSelectedCrop: (value: string) => void;
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
}

export default function WeatherForm({
  selectedRegion,
  setSelectedRegion,
  selectedCrop,
  setSelectedCrop,
  startDate,
  setStartDate,
}: WeatherFormProps) {
  const regions = [
    { value: "central", label: "Región Central" },
    { value: "norte", label: "Región Norte" },
    { value: "sur", label: "Región Sur" },
    { value: "pacifico", label: "Región Pacífico" },
    { value: "atlantico", label: "Región Atlántico" },
  ];

  const crops = [
    { value: "cafe", label: "Café" },
    { value: "maiz", label: "Maíz" },
    { value: "arroz", label: "Arroz" },
    { value: "platano", label: "Plátano" },
    { value: "papa", label: "Papa" },
    { value: "tomate", label: "Tomate" },
    { value: "cacao", label: "Cacao" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Parámetros
        </CardTitle>
        <CardDescription>
          Configura los parámetros para consultar el pronóstico
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Region Selection */}
        <div className="space-y-2">
          <Label htmlFor="region" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Región
          </Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger id="region">
              <SelectValue placeholder="Selecciona una región" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  {region.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Crop Selection */}
        <div className="space-y-2">
          <Label htmlFor="crop" className="flex items-center gap-2">
            <Sprout className="h-4 w-4" />
            Tipo de Cultivo
          </Label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger id="crop">
              <SelectValue placeholder="Selecciona un cultivo" />
            </SelectTrigger>
            <SelectContent>
              {crops.map((crop) => (
                <SelectItem key={crop.value} value={crop.value}>
                  {crop.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Fecha de Inicio</Label>
          <div className="border rounded-md p-3">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              className="rounded-md"
              disabled={(date) => date < new Date()}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
