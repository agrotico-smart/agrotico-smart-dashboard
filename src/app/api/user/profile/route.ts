import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT id, nombre, email, telefono, ubicacion, tipo, estado, created_at FROM usuarios WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({ user: users[0] });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { nombre, email, telefono, ubicacion } = await request.json();

    // Verificar si el email ya existe en otro usuario
    if (email !== session.user.email) {
      const [existingUsers] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM usuarios WHERE email = ? AND email != ?",
        [email, session.user.email]
      );

      if (existingUsers.length > 0) {
        return NextResponse.json({ error: "El email ya está en uso" }, { status: 400 });
      }
    }

    // Actualizar perfil
    await pool.query(
      "UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, ubicacion = ? WHERE email = ?",
      [nombre, email, telefono || null, ubicacion || null, session.user.email]
    );

    return NextResponse.json({ message: "Perfil actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}



