import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const robotUuid = request.nextUrl.searchParams.get('robot');
    

    // Construir query basado en si se especifica un robot
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
        cs.temperatura_2m,
        cs.temperatura_maxima,
        cs.temperatura_minima,
        cs.rango_temperatura,
        cs.temperatura_punto_rocio,
        cs.temperatura_humeda,
        cs.temperatura_superficie,
        cs.precipitacion_corregida,
        cs.humedad_relativa,
        cs.humedad_especifica,
        cs.velocidad_viento,
        cs.velocidad_viento_max,
        cs.velocidad_viento_min,
        cs.radiacion_onda_larga,
        cs.radiacion_onda_corta,
        cs.radiacion_cielo_despejado,
        cs.indice_claridad,
        cs.evaporacion,
        cs.presion_superficie
      FROM lecturas l
      LEFT JOIN sensor_bmp390 sb ON l.id = sb.lectura_id
      LEFT JOIN sensor_scd30 ss ON l.id = ss.lectura_id
      LEFT JOIN sensor_ltr390 sl ON l.id = sl.lectura_id
      LEFT JOIN sensor_suelo ssu ON l.id = ssu.lectura_id
      LEFT JOIN clima_satelital cs ON l.id = cs.lectura_id
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



