import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: "Contraseña actual y nueva contraseña son requeridas" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    // Obtener usuario actual
    const [users] = await pool.query<RowDataPacket[]>(
      "SELECT password_hash FROM usuarios WHERE email = ?",
      [session.user.email]
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const user = users[0];

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(oldPassword, user.password_hash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await pool.query(
      "UPDATE usuarios SET password_hash = ? WHERE email = ?",
      [newPasswordHash, session.user.email]
    );

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}



