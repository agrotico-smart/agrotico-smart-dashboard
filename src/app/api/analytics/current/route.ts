import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const robotUuid = request.nextUrl.searchParams.get('robot');
    

    // Construir query basado en si se especifica un robot
    // First try to join by lectura_id, if not found, fallback to most recent by robot_uuid
    let query = `
      SELECT 
        l.robot_uuid,
        l.timestamp,
        l.latitud,
        l.longitud,
        sb.temperatura_celsius,
        sb.presion_hpa,
        ss.humedad_pct,
        ss.co2_ppm,
        sl.lux,
        sl.indice_uv,
        ssu.humedad_suelo,
        ssu.temperatura_suelo_celsius,
        COALESCE(cs.temperatura_2m, csb.temperatura_2m) as temperatura_2m,
        COALESCE(cs.temperatura_maxima, csb.temperatura_maxima) as temperatura_maxima,
        COALESCE(cs.temperatura_minima, csb.temperatura_minima) as temperatura_minima,
        COALESCE(cs.rango_temperatura, csb.rango_temperatura) as rango_temperatura,
        COALESCE(cs.temperatura_punto_rocio, csb.temperatura_punto_rocio) as temperatura_punto_rocio,
        COALESCE(cs.temperatura_humeda, csb.temperatura_humeda) as temperatura_humeda,
        COALESCE(cs.temperatura_superficie, csb.temperatura_superficie) as temperatura_superficie,
        COALESCE(cs.precipitacion_corregida, csb.precipitacion_corregida) as precipitacion_corregida,
        COALESCE(cs.humedad_relativa, csb.humedad_relativa) as humedad_relativa,
        COALESCE(cs.humedad_especifica, csb.humedad_especifica) as humedad_especifica,
        COALESCE(cs.velocidad_viento, csb.velocidad_viento) as velocidad_viento,
        COALESCE(cs.velocidad_viento_max, csb.velocidad_viento_max) as velocidad_viento_max,
        COALESCE(cs.velocidad_viento_min, csb.velocidad_viento_min) as velocidad_viento_min,
        COALESCE(cs.radiacion_onda_larga, csb.radiacion_onda_larga) as radiacion_onda_larga,
        COALESCE(cs.radiacion_onda_corta, csb.radiacion_onda_corta) as radiacion_onda_corta,
        COALESCE(cs.radiacion_cielo_despejado, csb.radiacion_cielo_despejado) as radiacion_cielo_despejado,
        COALESCE(cs.indice_claridad, csb.indice_claridad) as indice_claridad,
        COALESCE(cs.evaporacion, csb.evaporacion) as evaporacion,
        COALESCE(cs.presion_superficie, csb.presion_superficie) as presion_superficie
      FROM lecturas l
      LEFT JOIN sensor_bmp390 sb ON l.id = sb.lectura_id
      LEFT JOIN sensor_scd30 ss ON l.id = ss.lectura_id
      LEFT JOIN sensor_ltr390 sl ON l.id = sl.lectura_id
      LEFT JOIN sensor_suelo ssu ON l.id = ssu.lectura_id
      LEFT JOIN clima_satelital cs ON l.id = cs.lectura_id
      LEFT JOIN (
        SELECT cs1.*
        FROM clima_satelital cs1
        INNER JOIN (
          SELECT robot_uuid, MAX(timestamp) as max_timestamp
          FROM clima_satelital
          GROUP BY robot_uuid
        ) cs2 ON cs1.robot_uuid = cs2.robot_uuid AND cs1.timestamp = cs2.max_timestamp
      ) csb ON l.robot_uuid = csb.robot_uuid AND cs.lectura_id IS NULL
      WHERE l.timestamp = (
        SELECT MAX(timestamp) 
        FROM lecturas l2 
        WHERE l2.robot_uuid = l.robot_uuid
      )
    `;
    
    let params: any[] = [];
    if (robotUuid) {
      query += ` AND l.robot_uuid = ?`;
      params.push(robotUuid);
    }
    
    query += ` ORDER BY l.timestamp DESC`;

    const [sensorRows] = await pool.query<RowDataPacket[]>(query, params);
    

    const sensorData = sensorRows.map((row) => ({
      robot_uuid: row.robot_uuid,
      timestamp: row.timestamp,
      location: {
        latitud: parseFloat(row.latitud) || 0,
        longitud: parseFloat(row.longitud) || 0,
      },
      temperature: {
        temperatura_celsius: parseFloat(row.temperatura_celsius) || 0,
        presion_hpa: parseFloat(row.presion_hpa) || 0,
      },
      humidity: {
        humedad_pct: parseFloat(row.humedad_pct) || 0,
        co2_ppm: parseFloat(row.co2_ppm) || 0,
      },
      light: {
        lux: parseFloat(row.lux) || 0,
        indice_uv: parseFloat(row.indice_uv) || 0,
      },
      soil: {
        humedad_suelo: parseInt(row.humedad_suelo) || 0,
        temperatura_suelo_celsius: parseFloat(row.temperatura_suelo_celsius) || 0,
      },
      climate: row.temperatura_2m ? {
        temperatura_2m: parseFloat(row.temperatura_2m) || 0,
        temperatura_maxima: parseFloat(row.temperatura_maxima) || 0,
        temperatura_minima: parseFloat(row.temperatura_minima) || 0,
        rango_temperatura: parseFloat(row.rango_temperatura) || 0,
        temperatura_punto_rocio: parseFloat(row.temperatura_punto_rocio) || 0,
        temperatura_humeda: parseFloat(row.temperatura_humeda) || 0,
        temperatura_superficie: parseFloat(row.temperatura_superficie) || 0,
        precipitacion_corregida: parseFloat(row.precipitacion_corregida) || 0,
        humedad_relativa: parseFloat(row.humedad_relativa) || 0,
        humedad_especifica: parseFloat(row.humedad_especifica) || 0,
        velocidad_viento: parseFloat(row.velocidad_viento) || 0,
        velocidad_viento_max: parseFloat(row.velocidad_viento_max) || 0,
        velocidad_viento_min: parseFloat(row.velocidad_viento_min) || 0,
        radiacion_onda_larga: parseFloat(row.radiacion_onda_larga) || 0,
        radiacion_onda_corta: parseFloat(row.radiacion_onda_corta) || 0,
        radiacion_cielo_despejado: parseFloat(row.radiacion_cielo_despejado) || 0,
        indice_claridad: parseFloat(row.indice_claridad) || 0,
        evaporacion: parseFloat(row.evaporacion) || 0,
        presion_superficie: parseFloat(row.presion_superficie) || 0,
      } : null,
    }));


    return NextResponse.json({
      success: true,
      data: sensorData,
      lastUpdate: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error fetching current sensor data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al cargar los datos de sensores actuales",
        data: [],
        lastUpdate: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}



