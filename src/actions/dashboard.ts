"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { RobotStats } from "@/lib/types";
import { RowDataPacket } from 'mysql2';

export async function getRobotsData(): Promise<{
  robots: RobotStats[];
  lastUpdate: string;
}> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.id,
        r.nombre,
        r.uuid,
        r.location as ubicacion,
        r.latitud,
        r.longitud,
        r.estado,
        r.updated_at as ultima_actividad,
        COUNT(l.id) as total_registros,
        COUNT(CASE WHEN DATE(l.timestamp) = CURDATE() THEN 1 END) as registros_hoy,
        AVG(sb.temperatura_celsius) as promedio_temperatura,
        AVG(ss.humedad_pct) as promedio_humedad,
        COUNT(CASE WHEN r.estado = 'inactivo' THEN 1 END) as alertas
      FROM robots r
      LEFT JOIN lecturas l ON r.uuid = l.robot_uuid
      LEFT JOIN sensor_bmp390 sb ON l.id = sb.lectura_id
      LEFT JOIN sensor_scd30 ss ON l.id = ss.lectura_id
      GROUP BY r.id, r.nombre, r.uuid, r.location, r.latitud, r.longitud, r.estado, r.updated_at
      ORDER BY total_registros DESC
    `
    );

    const robots = rows.map((row) => {
      // Parse coordinates safely
      const latitud = row.latitud != null ? parseFloat(row.latitud) : undefined;
      const longitud = row.longitud != null ? parseFloat(row.longitud) : undefined;
      
      return {
        id: row.id.toString(),
        nombre: row.nombre || "Robot Sin Nombre",
        uuid: row.uuid || "",
        ubicacion: row.ubicacion || "Ubicación No Especificada",
        latitud: latitud && !isNaN(latitud) ? latitud : undefined,
        longitud: longitud && !isNaN(longitud) ? longitud : undefined,
        estado: row.estado || "inactivo",
        ultima_actividad: row.ultima_actividad || new Date().toISOString(),
        total_registros: parseInt(row.total_registros) || 0,
        registros_hoy: parseInt(row.registros_hoy) || 0,
        promedio_temperatura: parseFloat(row.promedio_temperatura) || 0,
        promedio_humedad: parseFloat(row.promedio_humedad) || 0,
        alertas: parseInt(row.alertas) || 0,
      };
    });

    return {
      robots,
      lastUpdate: new Date().toLocaleString("es-ES"),
    };
  } catch (err: any) {
    console.error("Error loading robots from DB:", err);
    // In a real app, you'd want to handle this error more gracefully
    // For now, we'll return an empty array
    return {
      robots: [],
      lastUpdate: new Date().toLocaleString("es-ES"),
    };
  }
}

export async function generateNewRecord(robotUuid: string) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const targetRobotUuid = robotUuid || "f7e6de09-0d83-45e2-9d1b-a4dc4aa1c8cc";
    const now = new Date();
    const timestamp = new Date(now.getTime() - Math.random() * 1000 * 60 * 60);

    const temperatura = (20 + Math.random() * 15).toFixed(2);
    const presion = (850 + Math.random() * 100).toFixed(2);
    const humedad = (40 + Math.random() * 40).toFixed(2);
    const co2 = (200 + Math.random() * 200).toFixed(2);
    const lux = (Math.random() * 1000).toFixed(2);
    const indice_uv = (Math.random() * 11).toFixed(2);
    const humedad_suelo = Math.floor(200 + Math.random() * 400);
    const temperatura_suelo = (15 + Math.random() * 20).toFixed(2);
    const latitud = (9.0 + Math.random() * 2).toFixed(6);
    const longitud = (-84.0 + Math.random() * 2).toFixed(6);

    const [lecturaResult] = await connection.execute<RowDataPacket[] & any>(
      `INSERT INTO lecturas (robot_uuid, timestamp, latitud, longitud) VALUES (?, ?, ?, ?)`,
      [targetRobotUuid, timestamp, latitud, longitud]
    );
    const lecturaId = lecturaResult.insertId;

    await connection.execute(
      `INSERT INTO sensor_bmp390 (lectura_id, robot_uuid, timestamp, temperatura_celsius, presion_hpa) VALUES (?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, temperatura, presion]
    );

    await connection.execute(
      `INSERT INTO sensor_scd30 (lectura_id, robot_uuid, timestamp, humedad_pct, co2_ppm, temperatura_celsius) VALUES (?, ?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, humedad, co2, temperatura]
    );

    await connection.execute(
      `INSERT INTO sensor_ltr390 (lectura_id, robot_uuid, timestamp, lux, indice_uv) VALUES (?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, lux, indice_uv]
    );

    await connection.execute(
      `INSERT INTO sensor_suelo (lectura_id, robot_uuid, timestamp, humedad_suelo, temperatura_suelo_celsius) VALUES (?, ?, ?, ?, ?)`,
      [lecturaId, targetRobotUuid, timestamp, humedad_suelo, temperatura_suelo]
    );

    // Generar datos del satélite (todos los campos del schema)
    const temperatura_2m = (20 + Math.random() * 15).toFixed(2);
    const temperatura_maxima = (parseFloat(temperatura_2m) + Math.random() * 5).toFixed(2);
    const temperatura_minima = (parseFloat(temperatura_2m) - Math.random() * 5).toFixed(2);
    const rango_temperatura = (parseFloat(temperatura_maxima) - parseFloat(temperatura_minima)).toFixed(2);
    const temperatura_punto_rocio = (parseFloat(temperatura_2m) - Math.random() * 10).toFixed(2);
    const temperatura_humeda = (parseFloat(temperatura_2m) - Math.random() * 5).toFixed(2);
    const temperatura_superficie = (parseFloat(temperatura_2m) + Math.random() * 10 - 5).toFixed(2);
    const precipitacion_corregida = (Math.random() * 20).toFixed(2);
    const humedad_relativa = (40 + Math.random() * 40).toFixed(2);
    const humedad_especifica = (parseFloat(humedad_relativa) * 0.01 * Math.random() * 0.5).toFixed(4);
    const velocidad_viento = (Math.random() * 10).toFixed(2);
    const velocidad_viento_max = (parseFloat(velocidad_viento) + Math.random() * 5).toFixed(2);
    const velocidad_viento_min = (Math.random() * 2).toFixed(2);
    const radiacion_onda_larga = (200 + Math.random() * 200).toFixed(2);
    const radiacion_onda_corta = (Math.random() * 1000).toFixed(2);
    const radiacion_cielo_despejado = (parseFloat(radiacion_onda_corta) * (0.7 + Math.random() * 0.3)).toFixed(2);
    const indice_claridad = (Math.random()).toFixed(2);
    const evaporacion = (Math.random() * 5).toFixed(2);
    const presion_superficie = (850 + Math.random() * 100).toFixed(2);

    await connection.execute(
      `INSERT INTO clima_satelital (
        lectura_id,
        temperatura_2m, temperatura_maxima, temperatura_minima, rango_temperatura,
        temperatura_punto_rocio, temperatura_humeda, temperatura_superficie,
        precipitacion_corregida, humedad_relativa, humedad_especifica,
        velocidad_viento, velocidad_viento_max, velocidad_viento_min,
        radiacion_onda_larga, radiacion_onda_corta, radiacion_cielo_despejado,
        indice_claridad, evaporacion, presion_superficie,
        timestamp, robot_uuid
      ) VALUES (
        ?,
        ?, ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?, ?,
        ?, ?
      )`,
      [
        lecturaId,
        temperatura_2m, temperatura_maxima, temperatura_minima, rango_temperatura,
        temperatura_punto_rocio, temperatura_humeda, temperatura_superficie,
        precipitacion_corregida, humedad_relativa, humedad_especifica,
        velocidad_viento, velocidad_viento_max, velocidad_viento_min,
        radiacion_onda_larga, radiacion_onda_corta, radiacion_cielo_despejado,
        indice_claridad, evaporacion, presion_superficie,
        timestamp, targetRobotUuid
      ]
    );

    await connection.commit();

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    await connection.rollback();
    console.error("❌ Error generando registro:", error);
    return { success: false, error: "Error generando nuevo registro. Inténtalo de nuevo." };
  } finally {
    connection.release();
  }
}