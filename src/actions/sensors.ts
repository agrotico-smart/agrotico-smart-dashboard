"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export interface RobotData {
  id: number;
  nombre: string;
  uuid: string;
  latitud: number;
  longitud: number;
  estado: string;
  created_at: string;
  updated_at: string;
}

export interface SensorData {
  id: number;
  robot_uuid: string;
  timestamp: string;
  location: {
    latitud: number;
    longitud: number;
  };
  temperature?: {
    temperatura_celsius: number | null;
    presion_hpa: number | null;
  };
  humidity?: {
    humedad_pct: number | null;
    co2_ppm: number | null;
    temperatura_celsius: number | null;
  };
  light?: {
    lux: number | null;
    indice_uv: number | null;
  };
  soil?: {
    humedad_suelo: number | null;
    temperatura_suelo_celsius: number | null;
  };
  climate?: {
    temperatura_2m: number;
    temperatura_maxima: number;
    temperatura_minima: number;
    rango_temperatura: number;
    temperatura_punto_rocio: number;
    temperatura_humeda: number;
    temperatura_superficie: number;
    precipitacion_corregida: number;
    humedad_relativa: number;
    humedad_especifica: number;
    velocidad_viento: number;
    velocidad_viento_max: number;
    velocidad_viento_min: number;
    radiacion_onda_larga: number;
    radiacion_onda_corta: number;
    radiacion_cielo_despejado: number;
    indice_claridad: number;
    evaporacion: number;
    presion_superficie: number;
  };
  // Análisis calculados
  analysis?: {
    health_score: number;
    optimality_score: number;
    alerts: string[];
    recommendations: string[];
    trends: {
      temperature_trend: 'rising' | 'falling' | 'stable';
      humidity_trend: 'rising' | 'falling' | 'stable';
      pressure_trend: 'rising' | 'falling' | 'stable';
    };
  };
}

export interface HistoricalDataPoint {
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

// Funciones de validación de datos
const validateTemperature = (temp: number): boolean => temp >= -50 && temp <= 80;
const validateHumidity = (hum: number): boolean => hum >= 0 && hum <= 100;
const validatePressure = (press: number): boolean => press >= 800 && press <= 1200;
const validateCO2 = (co2: number): boolean => co2 >= 200 && co2 <= 2000;
const validateLux = (lux: number): boolean => lux >= 0 && lux <= 100000;
const validateUV = (uv: number): boolean => uv >= 0 && uv <= 15;
const validateSoilHumidity = (hum: number): boolean => hum >= 0 && hum <= 1000;
const validateSoilTemp = (temp: number): boolean => temp >= -20 && temp <= 60;

// Función para calcular tendencias
function calculateTrend(values: number[]): 'rising' | 'falling' | 'stable' {
  if (values.length < 2) return 'stable';
  
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  
  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'rising';
  if (change < -5) return 'falling';
  return 'stable';
}

// Función para calcular puntuación de salud
function calculateHealthScore(sensorData: SensorData): number {
  let score = 0;
  let factors = 0;

  // Temperatura (20-30°C es óptimo)
  if (sensorData.temperature?.temperatura_celsius !== null && sensorData.temperature?.temperatura_celsius !== undefined) {
    const temp = sensorData.temperature.temperatura_celsius;
    if (temp >= 20 && temp <= 30) score += 25;
    else if (temp >= 15 && temp <= 35) score += 15;
    else score += 5;
    factors++;
  }

  // Humedad (40-70% es óptimo)
  if (sensorData.humidity?.humedad_pct !== null && sensorData.humidity?.humedad_pct !== undefined) {
    const humidity = sensorData.humidity.humedad_pct;
    if (humidity >= 40 && humidity <= 70) score += 25;
    else if (humidity >= 30 && humidity <= 80) score += 15;
    else score += 5;
    factors++;
  }

  // CO2 (400-600 ppm es óptimo)
  if (sensorData.humidity?.co2_ppm !== null && sensorData.humidity?.co2_ppm !== undefined) {
    const co2 = sensorData.humidity.co2_ppm;
    if (co2 >= 400 && co2 <= 600) score += 25;
    else if (co2 >= 300 && co2 <= 800) score += 15;
    else score += 5;
    factors++;
  }

  // Luz (500-1000 lux es óptimo)
  if (sensorData.light?.lux !== null && sensorData.light?.lux !== undefined) {
    const light = sensorData.light.lux;
    if (light >= 500 && light <= 1000) score += 25;
    else if (light >= 200 && light <= 1500) score += 15;
    else score += 5;
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
}

// Función para generar alertas
function generateAlerts(sensorData: SensorData): string[] {
  const alerts: string[] = [];

  if (sensorData.temperature?.temperatura_celsius !== null && sensorData.temperature?.temperatura_celsius !== undefined) {
    const temp = sensorData.temperature.temperatura_celsius;
    if (temp < 10) alerts.push("⚠️ Temperatura muy baja - riesgo de heladas");
    if (temp > 35) alerts.push("🔥 Temperatura muy alta - estrés térmico");
  }

  if (sensorData.humidity?.humedad_pct !== null && sensorData.humidity?.humedad_pct !== undefined) {
    const humidity = sensorData.humidity.humedad_pct;
    if (humidity < 30) alerts.push("💧 Humedad muy baja - riesgo de deshidratación");
    if (humidity > 85) alerts.push("🌧️ Humedad muy alta - riesgo de enfermedades");
  }

  if (sensorData.humidity?.co2_ppm !== null && sensorData.humidity?.co2_ppm !== undefined) {
    const co2 = sensorData.humidity.co2_ppm;
    if (co2 > 1000) alerts.push("🌫️ CO2 elevado - ventilación insuficiente");
  }

  if (sensorData.light?.lux !== null && sensorData.light?.lux !== undefined) {
    const light = sensorData.light.lux;
    if (light < 200) alerts.push("☀️ Luz insuficiente - crecimiento lento");
    if (light > 2000) alerts.push("☀️ Luz excesiva - riesgo de quemaduras");
  }

  return alerts;
}

// Función para generar recomendaciones
function generateRecommendations(sensorData: SensorData): string[] {
  const recommendations: string[] = [];

  if (sensorData.temperature?.temperatura_celsius !== null && sensorData.temperature?.temperatura_celsius !== undefined) {
    const temp = sensorData.temperature.temperatura_celsius;
    if (temp < 20) recommendations.push("🌡️ Considera aumentar la temperatura del invernadero");
    if (temp > 30) recommendations.push("🌡️ Considera ventilar o enfriar el ambiente");
  }

  if (sensorData.humidity?.humedad_pct !== null && sensorData.humidity?.humedad_pct !== undefined) {
    const humidity = sensorData.humidity.humedad_pct;
    if (humidity < 40) recommendations.push("💧 Aumenta la humedad con riego o humidificadores");
    if (humidity > 70) recommendations.push("💧 Mejora la ventilación para reducir humedad");
  }

  if (sensorData.light?.lux !== null && sensorData.light?.lux !== undefined) {
    const light = sensorData.light.lux;
    if (light < 500) recommendations.push("☀️ Considera iluminación artificial suplementaria");
    if (light > 1500) recommendations.push("☀️ Considera sombreado para proteger las plantas");
  }

  return recommendations;
}

// Función para obtener datos del robot desde la tabla robots
export async function getRobotData(robotUuid: string): Promise<{
  success: boolean;
  data?: RobotData;
  error?: string;
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT id, nombre, uuid, latitud, longitud, estado, created_at, updated_at FROM robots WHERE uuid = ?`,
      [robotUuid]
    );

    if (rows.length === 0) {
      return { success: false, error: "Robot no encontrado" };
    }

    const robot = rows[0];
    const robotData: RobotData = {
      id: robot.id,
      nombre: robot.nombre,
      uuid: robot.uuid,
      latitud: parseFloat(robot.latitud),
      longitud: parseFloat(robot.longitud),
      estado: robot.estado,
      created_at: robot.created_at,
      updated_at: robot.updated_at,
    };

    return { success: true, data: robotData };
  } catch (error: any) {
    console.error("Error fetching robot data:", error);
    return { success: false, error: error.message || "Error desconocido al obtener datos del robot." };
  }
}

export async function getCurrentSensorData(robotUuid: string): Promise<{
  success: boolean;
  data?: SensorData;
  error?: string;
}> {
  try {
    // Obtener la última lectura para el robot específico
    const [lecturaRows] = await pool.query<RowDataPacket[]>(
      `SELECT id, robot_uuid, timestamp, latitud, longitud FROM lecturas WHERE robot_uuid = ? ORDER BY timestamp DESC LIMIT 1`,
      [robotUuid]
    );

    if (lecturaRows.length === 0) {
      return { success: true, data: undefined };
    }

    const ultimaLectura = lecturaRows[0];
    const lecturaId = ultimaLectura.id;

    // Obtener datos de todos los sensores para esa lectura
    const [bmp390Rows] = await pool.query<RowDataPacket[]>(
      `SELECT temperatura_celsius, presion_hpa FROM sensor_bmp390 WHERE lectura_id = ?`,
      [lecturaId]
    );
    
    const [scd30Rows] = await pool.query<RowDataPacket[]>(
      `SELECT humedad_pct, co2_ppm, temperatura_celsius FROM sensor_scd30 WHERE lectura_id = ?`,
      [lecturaId]
    );
    
    const [ltr390Rows] = await pool.query<RowDataPacket[]>(
      `SELECT lux, indice_uv FROM sensor_ltr390 WHERE lectura_id = ?`,
      [lecturaId]
    );
    
    const [sueloRows] = await pool.query<RowDataPacket[]>(
      `SELECT humedad_suelo, temperatura_suelo_celsius FROM sensor_suelo WHERE lectura_id = ?`,
      [lecturaId]
    );

    // Try to get climate data by lectura_id first, then fallback to robot_uuid
    let [climaRows] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM clima_satelital WHERE lectura_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [lecturaId]
    );
    
    // If no data found for this specific reading, get the most recent data for this robot
    if (climaRows.length === 0) {
      [climaRows] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM clima_satelital WHERE robot_uuid = ? ORDER BY timestamp DESC LIMIT 1`,
        [robotUuid]
      );
    }

    // Validar y limpiar datos de sensores
    const tempCelsius = parseFloat(bmp390Rows[0]?.temperatura_celsius || "0");
    const presionHpa = parseFloat(bmp390Rows[0]?.presion_hpa || "0");
    const humedadPct = parseFloat(scd30Rows[0]?.humedad_pct || "0");
    const co2Ppm = parseFloat(scd30Rows[0]?.co2_ppm || "0");
    const tempCelsiusHum = parseFloat(scd30Rows[0]?.temperatura_celsius || "0");
    const lux = parseFloat(ltr390Rows[0]?.lux || "0");
    const indiceUv = parseFloat(ltr390Rows[0]?.indice_uv || "0");
    const humedadSuelo = parseInt(sueloRows[0]?.humedad_suelo || "0");
    const tempSuelo = parseFloat(sueloRows[0]?.temperatura_suelo_celsius || "0");

    const sensorData: SensorData = {
      id: ultimaLectura.id,
      robot_uuid: ultimaLectura.robot_uuid,
      timestamp: ultimaLectura.timestamp,
      location: {
        latitud: ultimaLectura.latitud,
        longitud: ultimaLectura.longitud,
      },
      temperature: bmp390Rows.length > 0 ? {
        temperatura_celsius: validateTemperature(tempCelsius) ? tempCelsius : null,
        presion_hpa: validatePressure(presionHpa) ? presionHpa : null,
      } : undefined,
      humidity: scd30Rows.length > 0 ? {
        humedad_pct: validateHumidity(humedadPct) ? humedadPct : null,
        co2_ppm: validateCO2(co2Ppm) ? co2Ppm : null,
        temperatura_celsius: validateTemperature(tempCelsiusHum) ? tempCelsiusHum : null,
      } : undefined,
      light: ltr390Rows.length > 0 ? {
        lux: validateLux(lux) ? lux : null,
        indice_uv: validateUV(indiceUv) ? indiceUv : null,
      } : undefined,
      soil: sueloRows.length > 0 ? {
        humedad_suelo: validateSoilHumidity(humedadSuelo) ? humedadSuelo : null,
        temperatura_suelo_celsius: validateSoilTemp(tempSuelo) ? tempSuelo : null,
      } : undefined,
      climate: climaRows.length > 0 ? {
        temperatura_2m: parseFloat(climaRows[0].temperatura_2m || "0"),
        temperatura_maxima: parseFloat(climaRows[0].temperatura_maxima || "0"),
        temperatura_minima: parseFloat(climaRows[0].temperatura_minima || "0"),
        rango_temperatura: parseFloat(climaRows[0].rango_temperatura || "0"),
        temperatura_punto_rocio: parseFloat(climaRows[0].temperatura_punto_rocio || "0"),
        temperatura_humeda: parseFloat(climaRows[0].temperatura_humeda || "0"),
        temperatura_superficie: parseFloat(climaRows[0].temperatura_superficie || "0"),
        precipitacion_corregida: parseFloat(climaRows[0].precipitacion_corregida || "0"),
        humedad_relativa: parseFloat(climaRows[0].humedad_relativa || "0"),
        humedad_especifica: parseFloat(climaRows[0].humedad_especifica || "0"),
        velocidad_viento: parseFloat(climaRows[0].velocidad_viento || "0"),
        velocidad_viento_max: parseFloat(climaRows[0].velocidad_viento_max || "0"),
        velocidad_viento_min: parseFloat(climaRows[0].velocidad_viento_min || "0"),
        radiacion_onda_larga: parseFloat(climaRows[0].radiacion_onda_larga || "0"),
        radiacion_onda_corta: parseFloat(climaRows[0].radiacion_onda_corta || "0"),
        radiacion_cielo_despejado: parseFloat(climaRows[0].radiacion_cielo_despejado || "0"),
        indice_claridad: parseFloat(climaRows[0].indice_claridad || "0"),
        evaporacion: parseFloat(climaRows[0].evaporacion || "0"),
        presion_superficie: parseFloat(climaRows[0].presion_superficie || "0"),
      } : undefined,
    };

    // Obtener datos históricos para análisis de tendencias
    const [historicalRows] = await pool.query<RowDataPacket[]>(
      `SELECT b.temperatura_celsius, s.humedad_pct, b.presion_hpa 
       FROM lecturas l
       LEFT JOIN sensor_bmp390 b ON l.id = b.lectura_id
       LEFT JOIN sensor_scd30 s ON l.id = s.lectura_id
       WHERE l.robot_uuid = ? 
         AND l.timestamp >= DATE_SUB(NOW(), INTERVAL 6 HOUR)
       ORDER BY l.timestamp ASC`,
      [robotUuid]
    );

    // Calcular tendencias
    const tempValues = historicalRows.map(row => parseFloat(row.temperatura_celsius || "0")).filter(v => v > 0);
    const humidityValues = historicalRows.map(row => parseFloat(row.humedad_pct || "0")).filter(v => v > 0);
    const pressureValues = historicalRows.map(row => parseFloat(row.presion_hpa || "0")).filter(v => v > 0);

    // Agregar análisis calculado
    sensorData.analysis = {
      health_score: calculateHealthScore(sensorData),
      optimality_score: calculateHealthScore(sensorData), // Mismo cálculo por ahora
      alerts: generateAlerts(sensorData),
      recommendations: generateRecommendations(sensorData),
      trends: {
        temperature_trend: calculateTrend(tempValues),
        humidity_trend: calculateTrend(humidityValues),
        pressure_trend: calculateTrend(pressureValues),
      },
    };

    return { success: true, data: sensorData };
  } catch (error: any) {
    console.error("Error fetching current sensor data:", error);
    return { success: false, error: error.message || "Error desconocido al obtener datos de sensores." };
  }
}

export async function getHistoricalSensorData(
  robotUuid: string,
  hours: number = 24
): Promise<{
  success: boolean;
  data?: HistoricalDataPoint[];
  error?: string;
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        l.timestamp,
        COALESCE(b.temperatura_celsius, 0) as temperatura_celsius,
        COALESCE(s.humedad_pct, 0) as humedad_pct,
        COALESCE(lt.lux, 0) as lux,
        COALESCE(su.humedad_suelo, 0) as humedad_suelo,
        COALESCE(s.co2_ppm, 0) as co2_ppm,
        COALESCE(b.presion_hpa, 0) as presion_hpa,
        COALESCE(lt.indice_uv, 0) as indice_uv,
        COALESCE(su.temperatura_suelo_celsius, 0) as temperatura_suelo_celsius
      FROM lecturas l
      LEFT JOIN sensor_bmp390 b ON l.id = b.lectura_id
      LEFT JOIN sensor_scd30 s ON l.id = s.lectura_id
      LEFT JOIN sensor_ltr390 lt ON l.id = lt.lectura_id
      LEFT JOIN sensor_suelo su ON l.id = su.lectura_id
      WHERE l.robot_uuid = ? 
        AND l.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY l.timestamp ASC`,
      [robotUuid, hours]
    );

    const historicalData: HistoricalDataPoint[] = rows.map(row => ({
      timestamp: row.timestamp,
      temperatura_celsius: parseFloat(row.temperatura_celsius || "0"),
      humedad_pct: parseFloat(row.humedad_pct || "0"),
      lux: parseFloat(row.lux || "0"),
      humedad_suelo: parseInt(row.humedad_suelo || "0"),
      co2_ppm: parseFloat(row.co2_ppm || "0"),
      presion_hpa: parseFloat(row.presion_hpa || "0"),
      indice_uv: parseFloat(row.indice_uv || "0"),
      temperatura_suelo_celsius: parseFloat(row.temperatura_suelo_celsius || "0"),
    }));

    return { success: true, data: historicalData };
  } catch (error: any) {
    console.error("Error fetching historical sensor data:", error);
    return { success: false, error: error.message || "Error desconocido al obtener datos históricos." };
  }
}

// Función para obtener datos en tiempo real con actualización automática
export async function getRealtimeSensorData(
  robotUuid: string,
  includeAnalysis: boolean = true
): Promise<{
  success: boolean;
  data?: SensorData;
  error?: string;
  lastUpdate?: string;
}> {
  try {
    const result = await getCurrentSensorData(robotUuid);
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
        lastUpdate: new Date().toISOString(),
      };
    }
    
    return result;
  } catch (error: any) {
    console.error("Error fetching realtime sensor data:", error);
    return { success: false, error: error.message || "Error al obtener datos en tiempo real." };
  }
}

// Función para obtener estadísticas avanzadas
export async function getAdvancedSensorStats(
  robotUuid: string,
  hours: number = 24
): Promise<{
  success: boolean;
  stats?: {
    averages: {
      temperature: number;
      humidity: number;
      pressure: number;
      co2: number;
      light: number;
    };
    ranges: {
      temperature: { min: number; max: number };
      humidity: { min: number; max: number };
      pressure: { min: number; max: number };
    };
    trends: {
      temperature: 'rising' | 'falling' | 'stable';
      humidity: 'rising' | 'falling' | 'stable';
      pressure: 'rising' | 'falling' | 'stable';
    };
    anomalies: Array<{
      timestamp: string;
      sensor: string;
      value: number;
      expected: number;
      deviation: number;
    }>;
  };
  error?: string;
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
        l.timestamp,
        COALESCE(b.temperatura_celsius, 0) as temperatura_celsius,
        COALESCE(s.humedad_pct, 0) as humedad_pct,
        COALESCE(b.presion_hpa, 0) as presion_hpa,
        COALESCE(s.co2_ppm, 0) as co2_ppm,
        COALESCE(lt.lux, 0) as lux
      FROM lecturas l
      LEFT JOIN sensor_bmp390 b ON l.id = b.lectura_id
      LEFT JOIN sensor_scd30 s ON l.id = s.lectura_id
      LEFT JOIN sensor_ltr390 lt ON l.id = lt.lectura_id
      WHERE l.robot_uuid = ? 
        AND l.timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
      ORDER BY l.timestamp ASC`,
      [robotUuid, hours]
    );

    if (rows.length === 0) {
      return { success: false, error: "No hay datos disponibles para el análisis" };
    }

    const temperatures = rows.map(r => parseFloat(r.temperatura_celsius || "0")).filter(v => v > 0);
    const humidities = rows.map(r => parseFloat(r.humedad_pct || "0")).filter(v => v > 0);
    const pressures = rows.map(r => parseFloat(r.presion_hpa || "0")).filter(v => v > 0);
    const co2s = rows.map(r => parseFloat(r.co2_ppm || "0")).filter(v => v > 0);
    const lights = rows.map(r => parseFloat(r.lux || "0")).filter(v => v > 0);

    // Calcular promedios
    const averages = {
      temperature: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : 0,
      humidity: humidities.length > 0 ? humidities.reduce((a, b) => a + b, 0) / humidities.length : 0,
      pressure: pressures.length > 0 ? pressures.reduce((a, b) => a + b, 0) / pressures.length : 0,
      co2: co2s.length > 0 ? co2s.reduce((a, b) => a + b, 0) / co2s.length : 0,
      light: lights.length > 0 ? lights.reduce((a, b) => a + b, 0) / lights.length : 0,
    };

    // Calcular rangos
    const ranges = {
      temperature: {
        min: temperatures.length > 0 ? Math.min(...temperatures) : 0,
        max: temperatures.length > 0 ? Math.max(...temperatures) : 0,
      },
      humidity: {
        min: humidities.length > 0 ? Math.min(...humidities) : 0,
        max: humidities.length > 0 ? Math.max(...humidities) : 0,
      },
      pressure: {
        min: pressures.length > 0 ? Math.min(...pressures) : 0,
        max: pressures.length > 0 ? Math.max(...pressures) : 0,
      },
    };

    // Calcular tendencias
    const trends = {
      temperature: calculateTrend(temperatures),
      humidity: calculateTrend(humidities),
      pressure: calculateTrend(pressures),
    };

    // Detectar anomalías (valores que se desvían más del 20% del promedio)
    const anomalies: Array<{
      timestamp: string;
      sensor: string;
      value: number;
      expected: number;
      deviation: number;
    }> = [];

    rows.forEach(row => {
      const temp = parseFloat(row.temperatura_celsius || "0");
      const hum = parseFloat(row.humedad_pct || "0");
      const press = parseFloat(row.presion_hpa || "0");

      if (temp > 0 && Math.abs(temp - averages.temperature) / averages.temperature > 0.2) {
        anomalies.push({
          timestamp: row.timestamp,
          sensor: 'temperatura',
          value: temp,
          expected: averages.temperature,
          deviation: Math.abs(temp - averages.temperature) / averages.temperature * 100,
        });
      }

      if (hum > 0 && Math.abs(hum - averages.humidity) / averages.humidity > 0.2) {
        anomalies.push({
          timestamp: row.timestamp,
          sensor: 'humedad',
          value: hum,
          expected: averages.humidity,
          deviation: Math.abs(hum - averages.humidity) / averages.humidity * 100,
        });
      }

      if (press > 0 && Math.abs(press - averages.pressure) / averages.pressure > 0.2) {
        anomalies.push({
          timestamp: row.timestamp,
          sensor: 'presion',
          value: press,
          expected: averages.pressure,
          deviation: Math.abs(press - averages.pressure) / averages.pressure * 100,
        });
      }
    });

    return {
      success: true,
      stats: {
        averages,
        ranges,
        trends,
        anomalies,
      },
    };
  } catch (error: any) {
    console.error("Error fetching advanced sensor stats:", error);
    return { success: false, error: error.message || "Error al obtener estadísticas avanzadas." };
  }
}
