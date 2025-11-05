// Tipos para el dashboard
export interface DashboardData {
  total_robots: number;
  robots_activos: number;
  robots_inactivos: number;
  total_registros: number;
  registros_hoy: number;
  promedio_temperatura: number;
  promedio_humedad: number;
  alertas_activas: number;
}

export interface RobotStats {
  id: string;
  nombre: string;
  uuid: string;
  ubicacion: string;
  latitud?: number;
  longitud?: number;
  estado: string;
  ultima_actividad: string;
  total_registros: number;
  registros_hoy: number;
  promedio_temperatura: number;
  promedio_humedad: number;
  alertas: number;
}

export interface RegistrationRecord {
  id: string;
  robot_id: string;
  fecha: string;
  sensores: {
    temperatura: string;
    humedad: string;
    presion: string;
    co2: string;
    lux: string;
    humedad_suelo: number;
    ubicacion: string;
  };
}

// Tipos para sensores
export interface SensorDataLegacy {
  temperature?: {
    temperatura_celsius: string;
    presion_hpa: string;
  };
  humidity?: {
    humedad_pct: string;
    co2_ppm: string;
  };
  soil?: {
    humedad_suelo: number;
    temperatura_suelo_celsius: string;
  };
  light?: {
    lux: string;
    indice_uv: string;
  };
}

// Tipos para análisis de IA
export interface AIAnalysis {
  id: string;
  robot_id: string;
  fecha_analisis: string;
  modelo_ia: string;
  confianza_analisis: number;
  analisis_general: string;
  condiciones_terreno: {
    ph_estimado: number;
    materia_organica: number;
    textura: string;
    drenaje: string;
    nitrogeno: number;
    fosforo: number;
    potasio: number;
  };
  predicciones_climaticas: {
    proximos_30_dias: {
      temperatura_promedio: number;
      precipitacion_esperada: string;
      humedad_relativa: number;
      dias_lluvia: number;
    };
    proximos_90_dias: {
      temperatura_promedio: number;
      precipitacion_esperada: string;
      humedad_relativa: number;
      dias_lluvia: number;
    };
    proximos_180_dias: {
      temperatura_promedio: number;
      precipitacion_esperada: string;
      humedad_relativa: number;
      dias_lluvia: number;
    };
  };
  cultivos_recomendados: Array<{
    nombre: string;
    epoca_siembra: string;
    probabilidad_exito: number;
    razon: string;
  }>;
  plan_seis_meses: {
    mes_1: string;
    mes_2: string;
    mes_3: string;
    mes_4: string;
    mes_5: string;
    mes_6: string;
  };
  factores_riesgo: string[];
  oportunidades_optimizacion: string[];
}
