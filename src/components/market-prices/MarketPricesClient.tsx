"use client";

import { useState, useEffect } from "react";
import { MarketPriceData, MarketPriceHistory } from "@/lib/types";
import MarketPriceCard from "./MarketPriceCard";
import MarketPriceChart from "./MarketPriceChart";
import MarketPriceAlerts from "./MarketPriceAlert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, TrendingUp } from "lucide-react";
import { getMarketPriceHistory, updateMarketPrices } from "@/actions/market-prices";
import { toast } from "sonner";

interface MarketPricesClientProps {
  marketData: MarketPriceData;
}

const REGIONES = [
  'Nacional',
  'GAM',
  'Pacífico Norte',
  'Huetar Norte',
  'Pacífico Central',
  'Brunca',
  'Huetar Caribe'
];

const PRODUCTOS = [
  'Café',
  'Arroz',
  'Maíz',
  'Frijol',
  'Tomate',
  'Papa',
  'Caña de Azúcar'
];

const PERIODOS = [
  { value: '30', label: 'Últimos 30 días' },
  { value: '60', label: 'Últimos 60 días' },
  { value: '90', label: 'Últimos 90 días' },
];

export default function MarketPricesClient({ marketData }: MarketPricesClientProps) {
  const [selectedRegion, setSelectedRegion] = useState<string>('Nacional');
  const [selectedProduct, setSelectedProduct] = useState<string>('Café');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [priceHistory, setPriceHistory] = useState<MarketPriceHistory | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtrar precios por región seleccionada
  const filteredPrices = marketData.precios.filter(
    (price) => price.region === selectedRegion
  );

  const loadPriceHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const history = await getMarketPriceHistory(
        selectedProduct,
        selectedRegion,
        parseInt(selectedPeriod)
      );
      setPriceHistory(history);
    } catch (error) {
      console.error("Error loading price history:", error);
      toast.error("Error al cargar el historial de precios");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Cargar historial cuando cambian los filtros
  useEffect(() => {
    loadPriceHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct, selectedRegion, selectedPeriod]);

  const handleUpdatePrices = async () => {
    setIsUpdating(true);
    try {
      const result = await updateMarketPrices();
      if (result.success) {
        toast.success("Precios actualizados correctamente");
        window.location.reload();
      } else {
        toast.error("Error al actualizar precios");
      }
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error("Error al actualizar precios");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Precios de Mercado Agrícola
            </h1>
            <p className="text-gray-600 mt-1">
              Costa Rica - Última actualización: {marketData.ultima_actualizacion}
            </p>
          </div>
          <Button
            onClick={handleUpdatePrices}
            disabled={isUpdating}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Actualizando...' : 'Actualizar Precios'}
          </Button>
        </div>

        {/* Alertas */}
        <MarketPriceAlerts alerts={marketData.alertas} />

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Región
              </label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una región" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONES.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producto (para gráfico)
              </label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTOS.map((producto) => (
                    <SelectItem key={producto} value={producto}>
                      {producto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Período
              </label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un período" />
                </SelectTrigger>
                <SelectContent>
                  {PERIODOS.map((periodo) => (
                    <SelectItem key={periodo.value} value={periodo.value}>
                      {periodo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Price Chart */}
        {isLoadingHistory ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Cargando historial...</p>
          </div>
        ) : priceHistory ? (
          <MarketPriceChart history={priceHistory} />
        ) : null}

        {/* Price Cards Grid */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Precios Actuales - {selectedRegion}
          </h2>
          {filteredPrices.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredPrices.map((price) => (
                <MarketPriceCard key={price.id} price={price} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
              No hay datos disponibles para esta región
            </div>
          )}
        </div>

        {/* Information Footer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-1">ℹ️ Información importante</p>
          <p>
            Los precios mostrados son aproximaciones basadas en datos históricos y actuales del mercado 
            costarricense. Los precios reales pueden variar según el punto de venta, calidad del producto 
            y condiciones específicas de cada transacción. Se recomienda consultar con fuentes oficiales 
            como el CNP (Consejo Nacional de Producción) o el MAG (Ministerio de Agricultura y Ganadería) 
            para decisiones comerciales importantes.
          </p>
        </div>
      </div>
    </div>
  );
}
