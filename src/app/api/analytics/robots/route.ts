import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {

    // Obtener datos de robots con estadísticas
    const [robotsRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        r.id,
        r.nombre,
        r.uuid,
        r.location as ubicacion,
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
      GROUP BY r.id, r.nombre, r.uuid, r.location, r.estado, r.updated_at
      ORDER BY total_registros DESC
      `
    );

    // Obtener métricas generales del dashboard
    const [metricsRows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        COUNT(DISTINCT r.id) as total_robots,
        COUNT(CASE WHEN r.estado = 'activo' THEN 1 END) as robots_activos,
        COUNT(CASE WHEN r.estado = 'inactivo' THEN 1 END) as robots_inactivos,
        COUNT(l.id) as total_registros,
        COUNT(CASE WHEN DATE(l.timestamp) = CURDATE() THEN 1 END) as registros_hoy,
        AVG(sb.temperatura_celsius) as promedio_temperatura,
        AVG(ss.humedad_pct) as promedio_humedad,
        COUNT(CASE WHEN r.estado = 'inactivo' THEN 1 END) as alertas_activas
      FROM robots r
      LEFT JOIN lecturas l ON r.uuid = l.robot_uuid
      LEFT JOIN sensor_bmp390 sb ON l.id = sb.lectura_id
      LEFT JOIN sensor_scd30 ss ON l.id = ss.lectura_id
      `
    );

    const metrics = metricsRows[0] || {
      total_robots: 0,
      robots_activos: 0,
      robots_inactivos: 0,
      total_registros: 0,
      registros_hoy: 0,
      promedio_temperatura: 0,
      promedio_humedad: 0,
      alertas_activas: 0,
    };

    const robots = robotsRows.map((row) => ({
      id: row.id.toString(),
      nombre: row.nombre || "Robot Sin Nombre",
      uuid: row.uuid || "",
      ubicacion: row.ubicacion || "Ubicación No Especificada",
      estado: row.estado || "inactivo",
      ultima_actividad: row.ultima_actividad || new Date().toISOString(),
      total_registros: parseInt(row.total_registros) || 0,
      registros_hoy: parseInt(row.registros_hoy) || 0,
      promedio_temperatura: parseFloat(row.promedio_temperatura) || 0,
      promedio_humedad: parseFloat(row.promedio_humedad) || 0,
      alertas: parseInt(row.alertas) || 0,
    }));


    return NextResponse.json({
      success: true,
      data: {
        robots,
        metrics,
        lastUpdate: new Date().toISOString(),
      },
    }, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching robots analytics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error al cargar los datos de robots",
        data: {
          robots: [],
          metrics: {
            total_robots: 0,
            robots_activos: 0,
            robots_inactivos: 0,
            total_registros: 0,
            registros_hoy: 0,
            promedio_temperatura: 0,
            promedio_humedad: 0,
            alertas_activas: 0,
          },
          lastUpdate: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
