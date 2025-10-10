import { NextRequest, NextResponse } from "next/server";
import { generateNewRecord } from "@/actions/dashboard";

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const { robotUuid } = body;

    if (!robotUuid) {
      return NextResponse.json(
        {
          success: false,
          error: "robotUuid es requerido",
        },
        { status: 400 }
      );
    }

    const result = await generateNewRecord(robotUuid);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "Registro generado exitosamente",
      });
    } else {
      console.error("❌ Error generating record:", result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Error al generar el registro",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Error in generate record API:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}



