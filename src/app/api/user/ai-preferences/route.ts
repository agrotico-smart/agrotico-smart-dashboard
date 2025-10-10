import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { aiModel } = await request.json();

    if (!aiModel) {
      return NextResponse.json({ error: "Modelo de IA es requerido" }, { status: 400 });
    }

    // Validar que el modelo sea válido
    const validModels = ["deepseek-chat", "deepseek-coder", "gpt-3.5-turbo"];
    if (!validModels.includes(aiModel)) {
      return NextResponse.json({ error: "Modelo de IA no válido" }, { status: 400 });
    }

    // Actualizar preferencias de IA
    // Nota: Esto asume que tienes una tabla de preferencias o un campo en la tabla usuarios
    // Por ahora, solo retornamos éxito ya que no tenemos la estructura específica
    await pool.query(
      "UPDATE usuarios SET ai_model = ? WHERE email = ?",
      [aiModel, session.user.email]
    );

    return NextResponse.json({ message: "Preferencias de IA actualizadas exitosamente" });
  } catch (error) {
    console.error("Error al actualizar preferencias de IA:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}



