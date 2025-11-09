"use server";

import { revalidatePath } from "next/cache";
import pool from "@/lib/db";
import { MarketPrice, MarketPriceHistory, MarketPriceAlert, MarketPriceData } from "@/lib/types";
import { RowDataPacket } from 'mysql2';

// Productos agrícolas principales de Costa Rica
const PRODUCTOS = [
  'Café',
  'Arroz',
  'Maíz',
  'Frijol',
  'Tomate',
  'Papa',
  'Caña de Azúcar'
];

// Regiones de Costa Rica
const REGIONES = [
  'Nacional',
  'GAM',
  'Pacífico Norte',
  'Huetar Norte',
  'Pacífico Central',
  'Brunca',
  'Huetar Caribe'
];

/**
 * Obtiene los precios de mercado actuales para todos los productos
 */
export async function getMarketPrices(): Promise<MarketPriceData> {
  try {
    // Verificar si la tabla existe, si no, crearla
    await ensureMarketPricesTableExists();

    // Obtener los precios más recientes por producto y región
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        mp1.id,
        mp1.producto,
        mp1.precio_actual,
        mp1.unidad,
        mp1.region,
        mp1.fecha,
        mp1.precio_anterior,
        mp1.cambio_porcentual,
        mp1.tendencia
      FROM precios_mercado mp1
      INNER JOIN (
        SELECT producto, region, MAX(fecha) as max_fecha
        FROM precios_mercado
        GROUP BY producto, region
      ) mp2 ON mp1.producto = mp2.producto 
        AND mp1.region = mp2.region 
        AND mp1.fecha = mp2.max_fecha
      ORDER BY mp1.producto, mp1.region
      `
    );

    const precios: MarketPrice[] = rows.map((row) => ({
      id: row.id.toString(),
      producto: row.producto,
      precio_actual: parseFloat(row.precio_actual),
      unidad: row.unidad,
      region: row.region,
      fecha: row.fecha,
      precio_anterior: row.precio_anterior ? parseFloat(row.precio_anterior) : undefined,
      cambio_porcentual: row.cambio_porcentual ? parseFloat(row.cambio_porcentual) : undefined,
      tendencia: row.tendencia as 'subida' | 'bajada' | 'estable' | undefined,
    }));

    // Obtener alertas (cambios significativos > 5%)
    const alertas = await getMarketPriceAlerts();

    return {
      precios,
      alertas,
      ultima_actualizacion: new Date().toLocaleString("es-CR", {
        timeZone: "America/Costa_Rica",
      }),
    };
  } catch (err: any) {
    console.error("Error loading market prices from DB:", err);
    // Si no hay datos, generar datos iniciales
    await generateInitialMarketData();
    // Intentar de nuevo
    return getMarketPrices();
  }
}

/**
 * Obtiene el historial de precios para un producto y región específicos
 */
export async function getMarketPriceHistory(
  producto: string,
  region: string,
  dias: number = 30
): Promise<MarketPriceHistory> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT fecha, precio_actual as precio
      FROM precios_mercado
      WHERE producto = ? 
        AND region = ?
        AND fecha >= DATE_SUB(NOW(), INTERVAL ? DAY)
      ORDER BY fecha ASC
      `,
      [producto, region, dias]
    );

    const historial = rows.map((row) => ({
      fecha: row.fecha,
      precio: parseFloat(row.precio),
    }));

    return {
      producto,
      region,
      historial,
    };
  } catch (err: any) {
    console.error("Error loading price history:", err);
    return {
      producto,
      region,
      historial: [],
    };
  }
}

/**
 * Obtiene alertas de cambios significativos en precios
 */
export async function getMarketPriceAlerts(): Promise<MarketPriceAlert[]> {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `
      SELECT 
        id,
        producto,
        CASE 
          WHEN cambio_porcentual > 0 THEN 'subida'
          ELSE 'bajada'
        END as tipo,
        ABS(cambio_porcentual) as cambio_porcentual,
        precio_anterior,
        precio_actual,
        fecha,
        region
      FROM precios_mercado
      WHERE ABS(cambio_porcentual) >= 5
        AND fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      ORDER BY ABS(cambio_porcentual) DESC, fecha DESC
      LIMIT 10
      `
    );

    return rows.map((row) => ({
      id: row.id.toString(),
      producto: row.producto,
      tipo: row.tipo as 'subida' | 'bajada',
      cambio_porcentual: parseFloat(row.cambio_porcentual),
      precio_anterior: parseFloat(row.precio_anterior),
      precio_actual: parseFloat(row.precio_actual),
      fecha: row.fecha,
      region: row.region,
    }));
  } catch (err: any) {
    console.error("Error loading price alerts:", err);
    return [];
  }
}

/**
 * Asegura que la tabla de precios de mercado existe
 */
async function ensureMarketPricesTableExists() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS precios_mercado (
        id INT AUTO_INCREMENT PRIMARY KEY,
        producto VARCHAR(100) NOT NULL,
        precio_actual DECIMAL(10, 2) NOT NULL,
        precio_anterior DECIMAL(10, 2),
        cambio_porcentual DECIMAL(5, 2),
        unidad VARCHAR(50) NOT NULL,
        region VARCHAR(100) NOT NULL,
        fecha DATETIME NOT NULL,
        tendencia ENUM('subida', 'bajada', 'estable'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_producto_region_fecha (producto, region, fecha),
        INDEX idx_fecha (fecha)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
  } catch (err: any) {
    console.error("Error creating market prices table:", err);
  }
}

/**
 * Genera datos iniciales de precios de mercado
 */
async function generateInitialMarketData() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Precios base por producto (en colones costarricenses)
    const preciosBase: { [key: string]: { precio: number; unidad: string } } = {
      'Café': { precio: 850, unidad: 'kg' },
      'Arroz': { precio: 650, unidad: 'kg' },
      'Maíz': { precio: 320, unidad: 'kg' },
      'Frijol': { precio: 780, unidad: 'kg' },
      'Tomate': { precio: 920, unidad: 'kg' },
      'Papa': { precio: 450, unidad: 'kg' },
      'Caña de Azúcar': { precio: 28000, unidad: 'tonelada' },
    };

    // Generar datos para los últimos 90 días
    const diasHistoria = 90;
    const now = new Date();

    for (const producto of PRODUCTOS) {
      const baseInfo = preciosBase[producto];
      
      for (const region of REGIONES) {
        // Factor regional (±15%)
        const factorRegional = 0.85 + Math.random() * 0.3;
        
        let precioAnterior = baseInfo.precio * factorRegional;

        for (let dia = diasHistoria; dia >= 0; dia--) {
          const fecha = new Date(now);
          fecha.setDate(fecha.getDate() - dia);
          
          // Variación diaria pequeña (±2%)
          const variacionDiaria = 0.98 + Math.random() * 0.04;
          const precioActual = precioAnterior * variacionDiaria;
          
          // Calcular cambio
          const cambio = ((precioActual - precioAnterior) / precioAnterior) * 100;
          const tendencia = cambio > 0.5 ? 'subida' : cambio < -0.5 ? 'bajada' : 'estable';

          await connection.execute(
            `INSERT INTO precios_mercado 
            (producto, precio_actual, precio_anterior, cambio_porcentual, unidad, region, fecha, tendencia)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              producto,
              precioActual.toFixed(2),
              precioAnterior.toFixed(2),
              cambio.toFixed(2),
              baseInfo.unidad,
              region,
              fecha.toISOString().slice(0, 19).replace('T', ' '),
              tendencia
            ]
          );

          precioAnterior = precioActual;
        }
      }
    }

    await connection.commit();
    console.log("✅ Initial market data generated successfully");
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error generating initial market data:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Actualiza los precios de mercado (simulación semanal)
 */
export async function updateMarketPrices() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const producto of PRODUCTOS) {
      for (const region of REGIONES) {
        // Obtener el último precio
        const [lastPrice] = await connection.query<RowDataPacket[]>(
          `SELECT precio_actual, unidad FROM precios_mercado 
           WHERE producto = ? AND region = ?
           ORDER BY fecha DESC LIMIT 1`,
          [producto, region]
        );

        if (lastPrice.length > 0) {
          const precioAnterior = parseFloat(lastPrice[0].precio_actual);
          const unidad = lastPrice[0].unidad;
          
          // Generar nueva variación (±5%)
          const variacion = 0.95 + Math.random() * 0.1;
          const precioActual = precioAnterior * variacion;
          
          const cambio = ((precioActual - precioAnterior) / precioAnterior) * 100;
          const tendencia = cambio > 0.5 ? 'subida' : cambio < -0.5 ? 'bajada' : 'estable';

          await connection.execute(
            `INSERT INTO precios_mercado 
            (producto, precio_actual, precio_anterior, cambio_porcentual, unidad, region, fecha, tendencia)
            VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`,
            [producto, precioActual.toFixed(2), precioAnterior.toFixed(2), cambio.toFixed(2), unidad, tendencia]
          );
        }
      }
    }

    await connection.commit();
    revalidatePath("/precios-mercado");
    return { success: true };
  } catch (error) {
    await connection.rollback();
    console.error("❌ Error updating market prices:", error);
    return { success: false, error: "Error actualizando precios de mercado" };
  } finally {
    connection.release();
  }
}
