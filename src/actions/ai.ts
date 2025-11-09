
"use server";

import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { generateText } from "ai";
import { deepseek } from "@ai-sdk/deepseek";

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
  } | null;
  humidity?: {
    humedad_pct: number | null;
    co2_ppm: number | null;
    temperatura_celsius: number | null;
  } | null;
  light?: {
    lux: number | null;
    indice_uv: number | null;
  } | null;
  soil?: {
    humedad_suelo: number | null;
    temperatura_suelo_celsius: number | null;
  } | null;
  climate?: {
    temperatura_2m: number;
    temperatura_maxima: number;
    temperatura_minima: number;
    precipitacion_corregida: number;
    humedad_relativa: number;
    velocidad_viento: number;
    velocidad_viento_max: number;
    velocidad_viento_min: number;
    radiacion_onda_corta: number;
    presion_superficie: number;
    evaporacion: number;
  } | null;
}

// Since config.js is a CommonJS module, we use require
const config = require('../../config');

export async function getCurrentSensorData(robotUuid?: string) {
  try {
    // Obtener la última lectura para un robot específico o la más reciente
    let query = `SELECT id, robot_uuid, timestamp, latitud, longitud FROM lecturas`;
    let params: any[] = [];
    
    if (robotUuid) {
      query += ` WHERE robot_uuid = ? ORDER BY timestamp DESC LIMIT 1`;
      params.push(robotUuid);
    } else {
      query += ` ORDER BY timestamp DESC LIMIT 1`;
    }

    const [lecturaRows] = await pool.query<RowDataPacket[]>(query, params);

    if (lecturaRows.length === 0) {
      return null;
    }

    const lectura = lecturaRows[0];
    const lecturaId = lectura.id;

    // Obtener datos de sensores para esa lectura
    const [tempCurrent] = await pool.query<RowDataPacket[]>(
      `SELECT temperatura_celsius, presion_hpa FROM sensor_bmp390 WHERE lectura_id = ?`,
      [lecturaId]
    );
    const [humidityCurrent] = await pool.query<RowDataPacket[]>(
      `SELECT humedad_pct, co2_ppm, temperatura_celsius FROM sensor_scd30 WHERE lectura_id = ?`,
      [lecturaId]
    );
    const [lightCurrent] = await pool.query<RowDataPacket[]>(
      `SELECT lux, indice_uv FROM sensor_ltr390 WHERE lectura_id = ?`,
      [lecturaId]
    );
    const [soilCurrent] = await pool.query<RowDataPacket[]>(
      `SELECT humedad_suelo, temperatura_suelo_celsius FROM sensor_suelo WHERE lectura_id = ?`,
      [lecturaId]
    );

    // Obtener datos del satélite - try by lectura_id first, then fallback to robot_uuid
    let [climateCurrent] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM clima_satelital WHERE lectura_id = ? ORDER BY timestamp DESC LIMIT 1`,
      [lecturaId]
    );
    
    // If no data found for this specific reading, get the most recent data for this robot
    if (climateCurrent.length === 0 && robotUuid) {
      [climateCurrent] = await pool.query<RowDataPacket[]>(
        `SELECT * FROM clima_satelital WHERE robot_uuid = ? ORDER BY timestamp DESC LIMIT 1`,
        [robotUuid]
      );
    }

    return {
      id: lectura.id,
      robot_uuid: lectura.robot_uuid,
      timestamp: lectura.timestamp,
      location: {
        latitud: parseFloat(lectura.latitud),
        longitud: parseFloat(lectura.longitud),
      },
      temperature: tempCurrent[0] ? {
        temperatura_celsius: tempCurrent[0].temperatura_celsius ? parseFloat(tempCurrent[0].temperatura_celsius) : null,
        presion_hpa: tempCurrent[0].presion_hpa ? parseFloat(tempCurrent[0].presion_hpa) : null,
      } : null,
      humidity: humidityCurrent[0] ? {
        humedad_pct: humidityCurrent[0].humedad_pct ? parseFloat(humidityCurrent[0].humedad_pct) : null,
        co2_ppm: humidityCurrent[0].co2_ppm ? parseFloat(humidityCurrent[0].co2_ppm) : null,
        temperatura_celsius: humidityCurrent[0].temperatura_celsius ? parseFloat(humidityCurrent[0].temperatura_celsius) : null,
      } : null,
      light: lightCurrent[0] ? {
        lux: lightCurrent[0].lux ? parseFloat(lightCurrent[0].lux) : null,
        indice_uv: lightCurrent[0].indice_uv ? parseFloat(lightCurrent[0].indice_uv) : null,
      } : null,
      soil: soilCurrent[0] ? {
        humedad_suelo: soilCurrent[0].humedad_suelo ? parseInt(soilCurrent[0].humedad_suelo) : null,
        temperatura_suelo_celsius: soilCurrent[0].temperatura_suelo_celsius ? parseFloat(soilCurrent[0].temperatura_suelo_celsius) : null,
      } : null,
      climate: climateCurrent[0] ? {
        temperatura_2m: parseFloat(climateCurrent[0].temperatura_2m),
        temperatura_maxima: parseFloat(climateCurrent[0].temperatura_maxima),
        temperatura_minima: parseFloat(climateCurrent[0].temperatura_minima),
        precipitacion_corregida: parseFloat(climateCurrent[0].precipitacion_corregida),
        humedad_relativa: parseFloat(climateCurrent[0].humedad_relativa),
        velocidad_viento: parseFloat(climateCurrent[0].velocidad_viento),
        velocidad_viento_max: parseFloat(climateCurrent[0].velocidad_viento_max),
        velocidad_viento_min: parseFloat(climateCurrent[0].velocidad_viento_min),
        radiacion_onda_corta: parseFloat(climateCurrent[0].radiacion_onda_corta),
        presion_superficie: parseFloat(climateCurrent[0].presion_superficie),
        evaporacion: parseFloat(climateCurrent[0].evaporacion),
      } : null,
    };
  } catch (error) {
    console.error("Error getting current sensor data:", error);
    return null;
  }
}

export async function chatWithAI(messages: any[], currentSensorData: any) {
  try {
  const deepseekModel = config.deepseek.model;
  const deepseekApiKey = config.deepseek.apiKey;

    // Verificar si la API key es válida
    const isValidApiKey = deepseekApiKey && 
                         deepseekApiKey !== 'your_deepseek_api_key_here' && 
                         deepseekApiKey.startsWith('sk-');

    if (!isValidApiKey) {
      return generateIntelligentResponse(messages, currentSensorData);
    }

  const sensorSummary = {
      temperatura_celsius: parseFloat(currentSensorData?.temperature?.temperatura_celsius || "0"),
      presion_hpa: parseFloat(currentSensorData?.temperature?.presion_hpa || "0"),
      humedad_pct: parseFloat(currentSensorData?.humidity?.humedad_pct || "0"),
      co2_ppm: parseFloat(currentSensorData?.humidity?.co2_ppm || "0"),
      lux: parseFloat(currentSensorData?.light?.lux || "0"),
      indice_uv: parseFloat(currentSensorData?.light?.indice_uv || "0"),
      humedad_suelo: currentSensorData?.soil?.humedad_suelo || 0,
      temperatura_suelo_celsius: parseFloat(currentSensorData?.soil?.temperatura_suelo_celsius || "0"),
    };

    const hasLat =
      typeof currentSensorData?.location?.latitud === "number" &&
      Number.isFinite(currentSensorData.location.latitud);
    const hasLng =
      typeof currentSensorData?.location?.longitud === "number" &&
      Number.isFinite(currentSensorData.location.longitud);
    const locationSummary = hasLat && hasLng
      ? {
          lat: currentSensorData.location.latitud,
          lng: currentSensorData.location.longitud,
        }
      : null;

    const systemPrompt = `Eres AgroTico AI, un asistente de inteligencia artificial especializado en agricultura de precisión y análisis de datos agrícolas. Eres parte del sistema Agrotico Smart Dashboard, una plataforma avanzada de monitoreo agrícola.

## 🎯 TU IDENTIDAD Y EXPERTISE:
- **Especialista en**: Agronomía, agricultura de precisión, análisis de datos de sensores, gestión de cultivos
- **Experiencia**: Análisis de condiciones ambientales, optimización de rendimientos, prevención de enfermedades
- **Enfoque**: Soluciones prácticas, recomendaciones basadas en datos, agricultura sostenible

## 📊 DATOS DE SENSORES DISPONIBLES:
- **Temperatura Ambiente**: ${sensorSummary.temperatura_celsius}°C
- **Presión Atmosférica**: ${sensorSummary.presion_hpa} hPa  
- **Humedad Relativa**: ${sensorSummary.humedad_pct}%
- **CO2**: ${sensorSummary.co2_ppm} ppm
- **Luminosidad**: ${sensorSummary.lux} lux
- **Índice UV**: ${sensorSummary.indice_uv}
- **Humedad del Suelo**: ${sensorSummary.humedad_suelo} (valor raw)
- **Temperatura del Suelo**: ${sensorSummary.temperatura_suelo_celsius}°C
- **Ubicación Aproximada**: ${
      locationSummary
        ? `Latitud ${locationSummary.lat.toFixed(5)}°, Longitud ${locationSummary.lng.toFixed(5)}°`
        : "No disponible"
    }

## 🎨 ESTILO DE RESPUESTA:
- **Profesional pero accesible**: Usa lenguaje técnico cuando sea necesario, pero explica conceptos complejos
- **Estructurado**: Organiza la información con emojis, títulos y secciones claras
- **Accionable**: Siempre incluye recomendaciones específicas y prácticas priorizadas
- **Contextual**: Relaciona los datos con el tipo de cultivo, etapa fenológica y condiciones locales
- **Preventivo**: Identifica riesgos potenciales antes de que se conviertan en problemas
- **Transparente**: Indica si los datos son estimados, simulados, incompletos o tienen más de 24 horas

## 🤝 Estrategia de conversación:
- Solicita detalles clave cuando falten (cultivo, etapa, ubicación, objetivos de producción).
- Formula preguntas de seguimiento que ayuden al usuario a profundizar o validar la recomendación.
- Propón verificaciones manuales cuando detectes incertidumbre en los sensores o inconsistencias.
- Señala el momento de la última lectura disponible y la confianza en los datos.

## 🧭 Flujo sugerido:
1. Resume el contexto y los datos disponibles (incluye timestamp y robot si aplica).
2. Interpreta métricas y detecta riesgos u oportunidades.
3. Recomienda acciones priorizadas y explica el porqué.
4. Sugiere próximos pasos y plantea una pregunta de seguimiento para continuar el análisis.

## 🌱 ÁREAS DE EXPERTISE:
1. **Análisis de Condiciones Ambientales**: Interpretación de datos de sensores
2. **Gestión de Cultivos**: Recomendaciones de siembra, riego, fertilización
3. **Prevención de Enfermedades**: Detección temprana de problemas fitosanitarios
4. **Optimización de Recursos**: Eficiencia hídrica, energética y de nutrientes
5. **Agricultura Sostenible**: Prácticas eco-amigables y conservación del suelo
6. **Tecnología Agrícola**: IoT, sensores, automatización agrícola

## 📋 FORMATO DE RESPUESTA RECOMENDADO:
- **Análisis**: Interpretación de los datos actuales
- **Recomendaciones**: Acciones específicas a tomar
- **Alertas**: Riesgos o problemas identificados
- **Contexto**: Información adicional relevante
- **Próximos Pasos**: Plan de acción sugerido
- **Preguntas de Seguimiento**: Al menos una pregunta para obtener contexto adicional o confirmar hallazgos

Responde siempre en español y mantén el foco en la agricultura. Si el usuario pregunta algo no relacionado, redirige educadamente hacia temas agrícolas. Si piden la ubicación y hay coordenadas disponibles, comparte la latitud y longitud y sugiere corroborarlas en el dashboard. Si no hay un robot seleccionado o los datos son antiguos o simulados, indícalo explícitamente y recomienda seleccionar o sincronizar un robot específico.`;


    const result = await generateText({
    model: deepseek.chat(deepseekModel),
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

    return result.text;
  } catch (error) {
    console.error("❌ Error in chatWithAI:", error);
    return generateIntelligentResponse(messages, currentSensorData);
  }
}

function generateIntelligentResponse(messages: any[], currentSensorData: any) {
  
  if (!currentSensorData) {
    return "⚠️ **Datos no disponibles**\n\nNo tengo lecturas de sensores asociadas a un robot específico en este momento. Selecciona un robot desde el panel o vincula uno nuevo para que pueda analizar sus datos y responder con precisión.";
  }

  const lastMessage = messages[messages.length - 1];
  const rawUserMessage = lastMessage?.content || "";
  const userMessage = rawUserMessage.toLowerCase();
  const normalizedMessage =
    rawUserMessage
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "";

  const hasLat =
    typeof currentSensorData?.location?.latitud === "number" &&
    Number.isFinite(currentSensorData.location.latitud);
  const hasLng =
    typeof currentSensorData?.location?.longitud === "number" &&
    Number.isFinite(currentSensorData.location.longitud);
  const locationData = hasLat && hasLng
    ? {
        lat: currentSensorData.location.latitud,
        lng: currentSensorData.location.longitud,
      }
    : null;
  const asksForLocation =
    normalizedMessage.includes("ubicacion") ||
    normalizedMessage.includes("ubicado") ||
    normalizedMessage.includes("ubicarse") ||
    normalizedMessage.includes("donde esta") ||
    normalizedMessage.includes("donde se encuentra") ||
    normalizedMessage.includes("posicion del robot");

  const dataTimestamp = currentSensorData?.timestamp
    ? new Date(currentSensorData.timestamp).toLocaleString("es-ES", {
        timeZone: "America/Costa_Rica",
      })
    : null;

  if (asksForLocation) {
    if (locationData) {
      return `📍 **Ubicación Aproximada del Robot**\n\nEl robot reporta coordenadas cercanas a **latitud ${locationData.lat.toFixed(
        5
      )}°, longitud ${locationData.lng.toFixed(
        5
      )}°**.\n\nRevisa el mapa del dashboard para confirmar la posición exacta y obtener más contexto del entorno. ¿Deseas que analice las condiciones actuales en esa zona?`;
    }

    return "📍 **Ubicación no disponible**\n\nAún no recibo coordenadas válidas del robot seleccionado. Verifica que el robot esté transmitiendo datos y vuelve a intentarlo o consulta el panel de dispositivos para confirmar la última ubicación registrada.";
  }
  
  const sensorSummary = {
    temperatura_celsius: parseFloat(currentSensorData?.temperature?.temperatura_celsius || "0"),
    presion_hpa: parseFloat(currentSensorData?.temperature?.presion_hpa || "0"),
    humedad_pct: parseFloat(currentSensorData?.humidity?.humedad_pct || "0"),
    co2_ppm: parseFloat(currentSensorData?.humidity?.co2_ppm || "0"),
    lux: parseFloat(currentSensorData?.light?.lux || "0"),
    indice_uv: parseFloat(currentSensorData?.light?.indice_uv || "0"),
    humedad_suelo: currentSensorData?.soil?.humedad_suelo || 0,
    temperatura_suelo_celsius: parseFloat(currentSensorData?.soil?.temperatura_suelo_celsius || "0"),
  };

  // Análisis avanzado de las condiciones ambientales
  let analysis = "";
  let recommendations = "";
  let alerts = "";
  let nextSteps = "";

  if (dataTimestamp) {
    analysis += `🕒 **Última lectura registrada**: ${dataTimestamp}.\n`;
  }

  if (locationData) {
    analysis += `📍 **Ubicación Aproximada**: Latitud ${locationData.lat.toFixed(
      5
    )}°, longitud ${locationData.lng.toFixed(5)}°.\n`;
  }

  // Análisis de temperatura ambiente
  if (sensorSummary.temperatura_celsius > 35) {
    analysis += "🌡️ **Temperatura Crítica Alta**: " + sensorSummary.temperatura_celsius + "°C está por encima del rango óptimo para la mayoría de cultivos.\n";
    recommendations += "💡 **Acción Inmediata**: Implementa sombra temporal, aumenta la frecuencia de riego y considera sistemas de nebulización.\n";
    alerts += "🚨 **Alerta Crítica**: Riesgo de estrés térmico y marchitamiento de plantas.\n";
    nextSteps += "📋 **Monitoreo**: Revisa las plantas cada 2-3 horas para detectar signos de estrés.\n";
  } else if (sensorSummary.temperatura_celsius > 30) {
    analysis += "🌡️ **Temperatura Alta**: " + sensorSummary.temperatura_celsius + "°C es ideal para cultivos tropicales pero requiere atención para otros.\n";
    recommendations += "💡 **Recomendación**: Proporciona sombra parcial durante las horas más calurosas (11:00-15:00).\n";
  } else if (sensorSummary.temperatura_celsius < 10) {
    analysis += "🌡️ **Temperatura Crítica Baja**: " + sensorSummary.temperatura_celsius + "°C puede causar daño por heladas en cultivos sensibles.\n";
    recommendations += "💡 **Acción Inmediata**: Cubre las plantas con tela antihelada o considera calefacción en invernaderos.\n";
    alerts += "🚨 **Alerta Crítica**: Riesgo de daño por heladas.\n";
    nextSteps += "📋 **Monitoreo**: Verifica la temperatura cada hora durante la noche.\n";
  } else if (sensorSummary.temperatura_celsius < 15) {
    analysis += "🌡️ **Temperatura Baja**: " + sensorSummary.temperatura_celsius + "°C ralentiza el crecimiento pero es tolerable para cultivos de temporada fría.\n";
    recommendations += "💡 **Recomendación**: Considera cultivos de invierno o protecciones adicionales.\n";
  } else {
    analysis += "🌡️ **Temperatura Óptima**: " + sensorSummary.temperatura_celsius + "°C está en el rango ideal para la mayoría de cultivos.\n";
  }

  // Análisis de humedad relativa
  if (sensorSummary.humedad_pct > 85) {
    analysis += "💧 **Humedad Crítica Alta**: " + sensorSummary.humedad_pct + "% favorece el desarrollo de enfermedades fúngicas y bacterianas.\n";
    recommendations += "💡 **Acción Inmediata**: Mejora la ventilación, reduce el riego y considera fungicidas preventivos.\n";
    alerts += "🚨 **Alerta Crítica**: Alto riesgo de enfermedades fúngicas (mildiu, oídio, botritis).\n";
    nextSteps += "📋 **Inspección**: Revisa las hojas en busca de manchas, moho o decoloración.\n";
  } else if (sensorSummary.humedad_pct > 70) {
    analysis += "💧 **Humedad Alta**: " + sensorSummary.humedad_pct + "% requiere monitoreo para prevenir enfermedades.\n";
    recommendations += "💡 **Recomendación**: Aumenta la ventilación y evita el riego por aspersión.\n";
  } else if (sensorSummary.humedad_pct < 30) {
    analysis += "💧 **Humedad Crítica Baja**: " + sensorSummary.humedad_pct + "% causa estrés hídrico severo y reduce la transpiración.\n";
    recommendations += "💡 **Acción Inmediata**: Aumenta el riego, implementa sistemas de nebulización y considera sombra.\n";
    alerts += "🚨 **Alerta Crítica**: Riesgo de marchitamiento y reducción de rendimiento.\n";
    nextSteps += "📋 **Monitoreo**: Verifica el estado de las hojas y el suelo cada 4 horas.\n";
  } else if (sensorSummary.humedad_pct < 50) {
    analysis += "💧 **Humedad Baja**: " + sensorSummary.humedad_pct + "% puede causar estrés hídrico moderado.\n";
    recommendations += "💡 **Recomendación**: Aumenta la frecuencia de riego y considera cultivos tolerantes a sequía.\n";
  } else {
    analysis += "💧 **Humedad Óptima**: " + sensorSummary.humedad_pct + "% es ideal para la mayoría de cultivos.\n";
  }

  // Análisis de luminosidad
  if (sensorSummary.lux < 50) {
    analysis += "☀️ **Luz Insuficiente**: " + sensorSummary.lux + " lux es crítico para la fotosíntesis.\n";
    recommendations += "💡 **Acción Inmediata**: Implementa iluminación artificial LED o considera cultivos de sombra.\n";
    alerts += "⚠️ **Alerta**: Las plantas no pueden realizar fotosíntesis adecuadamente.\n";
  } else if (sensorSummary.lux < 200) {
    analysis += "☀️ **Luz Baja**: " + sensorSummary.lux + " lux limita el crecimiento de cultivos que requieren mucha luz.\n";
    recommendations += "💡 **Recomendación**: Considera cultivos de sombra o iluminación suplementaria.\n";
  } else if (sensorSummary.lux > 50000) {
    analysis += "☀️ **Luz Intensa**: " + sensorSummary.lux + " lux es excelente para cultivos de alta luminosidad.\n";
    recommendations += "💡 **Recomendación**: Aprovecha para cultivos como tomates, pimientos y plantas de sol.\n";
  } else if (sensorSummary.lux > 10000) {
    analysis += "☀️ **Luz Abundante**: " + sensorSummary.lux + " lux es ideal para la mayoría de cultivos.\n";
  } else {
    analysis += "☀️ **Luz Adecuada**: " + sensorSummary.lux + " lux es suficiente para el crecimiento normal.\n";
  }

  // Análisis de CO2
  if (sensorSummary.co2_ppm < 200) {
    analysis += "🌿 **CO2 Crítico Bajo**: " + sensorSummary.co2_ppm + " ppm limita severamente la fotosíntesis.\n";
    recommendations += "💡 **Acción Inmediata**: Mejora la ventilación o considera enriquecimiento de CO2.\n";
    alerts += "🚨 **Alerta Crítica**: Las plantas no pueden crecer adecuadamente.\n";
  } else if (sensorSummary.co2_ppm < 300) {
    analysis += "🌿 **CO2 Bajo**: " + sensorSummary.co2_ppm + " ppm puede limitar el crecimiento.\n";
    recommendations += "💡 **Recomendación**: Mejora la ventilación del área de cultivo.\n";
  } else if (sensorSummary.co2_ppm > 2000) {
    analysis += "🌿 **CO2 Crítico Alto**: " + sensorSummary.co2_ppm + " ppm puede ser tóxico para plantas y humanos.\n";
    recommendations += "💡 **Acción Inmediata**: Ventila inmediatamente el área y evacúa si es necesario.\n";
    alerts += "🚨 **Alerta Crítica**: Riesgo de toxicidad por CO2.\n";
  } else if (sensorSummary.co2_ppm > 1000) {
    analysis += "🌿 **CO2 Alto**: " + sensorSummary.co2_ppm + " ppm puede ser tóxico para las plantas.\n";
    recommendations += "💡 **Recomendación**: Mejora la ventilación del área de cultivo.\n";
    alerts += "⚠️ **Alerta**: Niveles de CO2 elevados, verifica la ventilación.\n";
  } else {
    analysis += "🌿 **CO2 Óptimo**: " + sensorSummary.co2_ppm + " ppm es ideal para la fotosíntesis.\n";
  }

  // Análisis de temperatura del suelo
  if (sensorSummary.temperatura_suelo_celsius > 35) {
    analysis += "🌱 **Temperatura del Suelo Alta**: " + sensorSummary.temperatura_suelo_celsius + "°C puede dañar las raíces.\n";
    recommendations += "💡 **Recomendación**: Aplica mulch para enfriar el suelo y aumenta el riego.\n";
  } else if (sensorSummary.temperatura_suelo_celsius < 10) {
    analysis += "🌱 **Temperatura del Suelo Baja**: " + sensorSummary.temperatura_suelo_celsius + "°C ralentiza la absorción de nutrientes.\n";
    recommendations += "💡 **Recomendación**: Considera calentamiento del suelo o cultivos de temporada fría.\n";
  } else {
    analysis += "🌱 **Temperatura del Suelo Óptima**: " + sensorSummary.temperatura_suelo_celsius + "°C favorece el crecimiento radicular.\n";
  }

  // Análisis de humedad del suelo
  if (sensorSummary.humedad_suelo < 200) {
    analysis += "💧 **Suelo Seco**: Humedad del suelo muy baja (" + sensorSummary.humedad_suelo + "), riesgo de estrés hídrico.\n";
    recommendations += "💡 **Recomendación**: Riega inmediatamente y considera sistemas de riego más frecuentes.\n";
    alerts += "⚠️ **Alerta**: Riesgo de marchitamiento por falta de agua.\n";
  } else if (sensorSummary.humedad_suelo > 600) {
    analysis += "💧 **Suelo Saturado**: Humedad del suelo muy alta (" + sensorSummary.humedad_suelo + "), riesgo de asfixia radicular.\n";
    recommendations += "💡 **Recomendación**: Reduce el riego y mejora el drenaje del suelo.\n";
    alerts += "⚠️ **Alerta**: Riesgo de pudrición de raíces.\n";
  } else {
    analysis += "💧 **Humedad del Suelo Adecuada**: " + sensorSummary.humedad_suelo + " está en rango óptimo.\n";
  }

  // Respuesta contextual mejorada
  let contextualResponse = "";
  
  if (userMessage.includes("hola") || userMessage.includes("cómo estás") || userMessage.includes("buenos días")) {
    contextualResponse = "¡Hola! Soy AgroTico AI, tu asistente especializado en agricultura de precisión. ";
  } else if (userMessage.includes("análisis") || userMessage.includes("analizar") || userMessage.includes("diagnóstico")) {
    contextualResponse = "## 🔍 Análisis Agrícola Detallado\n\nBasándome en los datos de tus sensores, aquí tienes un análisis completo:\n\n";
  } else if (userMessage.includes("recomendación") || userMessage.includes("recomendaciones") || userMessage.includes("qué hacer")) {
    contextualResponse = "## 💡 Recomendaciones Agrícolas\n\nAquí tienes mis recomendaciones basadas en las condiciones actuales:\n\n";
  } else if (userMessage.includes("problema") || userMessage.includes("problemas") || userMessage.includes("alerta")) {
    contextualResponse = "## ⚠️ Diagnóstico de Problemas\n\nAnalizando los datos de tus sensores para identificar posibles problemas:\n\n";
  } else if (userMessage.includes("cultivo") || userMessage.includes("plantar") || userMessage.includes("siembra")) {
    contextualResponse = "## 🌱 Recomendaciones de Cultivo\n\nBasándome en las condiciones actuales, aquí tienes mis recomendaciones:\n\n";
  } else if (userMessage.includes("riego") || userMessage.includes("agua") || userMessage.includes("humedad")) {
    contextualResponse = "## 💧 Gestión del Riego\n\nAnalizando las condiciones hídricas de tu cultivo:\n\n";
  } else {
    contextualResponse = "## 📊 Análisis de Condiciones Agrícolas\n\nBasándome en los datos de tus sensores, aquí tienes mi análisis:\n\n";
  }

  const followUps: string[] = [];
  const addFollowUp = (item: string) => {
    if (!followUps.includes(item)) {
      followUps.push(item);
    }
  };

  if (!currentSensorData?.soil || currentSensorData?.soil?.humedad_suelo == null) {
    addFollowUp(
      "¿Puedes compartir observaciones recientes sobre la humedad del suelo o la textura del sustrato?"
    );
  }

  if (!currentSensorData?.light || currentSensorData?.light?.lux == null) {
    addFollowUp(
      "Confírmame si el cultivo recibe sombra parcial o si has notado cambios de luminosidad durante el día."
    );
  }

  if (!normalizedMessage.includes("cultivo") && !normalizedMessage.includes("variedad")) {
    addFollowUp(
      "Indícame el cultivo, variedad y etapa fenológica para ajustar mejor las recomendaciones."
    );
  }

  if (!normalizedMessage.includes("riego") && !normalizedMessage.includes("fert")) {
    addFollowUp(
      "¿Tienes un calendario de riego o fertilización que debamos considerar?"
    );
  }

  const followUpSection =
    "### 🤔 Preguntas de Seguimiento\n\n" +
    (followUps.length
      ? followUps.map((item) => `- ${item}`).join("\n")
      : "- ¿Deseas profundizar en algún cultivo, parcela o riesgo específico?") +
    "\n";

  const response = contextualResponse + 
    "### 📈 Estado Actual de los Sensores\n\n" +
    analysis + "\n" +
    "### 🎯 Recomendaciones Específicas\n\n" +
    recommendations + "\n" +
    "### 🚨 Alertas y Advertencias\n\n" +
    (alerts || "✅ **Estado Normal**: No hay alertas críticas en este momento.\n") +
    "\n" +
    "### 📋 Próximos Pasos\n\n" +
    (nextSteps ||
      "📊 **Monitoreo Continuo**: Mantén el seguimiento de los sensores cada 4-6 horas y registra observaciones de campo.\n") +
    "\n" +
    followUpSection +
    "\n---\n" +
    "🤖 **AgroTico AI** - Asistente de Agricultura de Precisión\n" +
    "💡 *Nota: Esta es una respuesta simulada basada en tus datos de sensores. Para análisis más avanzados, configura una API key válida de DeepSeek.*";

  return response;
}
