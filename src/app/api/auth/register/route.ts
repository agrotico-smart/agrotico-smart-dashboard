import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

// Forzar renderizado dinámico
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, password, telefono, ubicacion } = await request.json();

    // Validaciones básicas
    if (!nombre || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const [existingUsers] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Insertar usuario en la base de datos
    const [result] = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, telefono, ubicacion, tipo, estado) 
       VALUES (?, ?, ?, ?, ?, 'usuario', 'activo')`,
      [nombre, email, password_hash, telefono || null, ubicacion || null]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Obtener el usuario creado
    const [newUser] = await pool.query<RowDataPacket[]>(
      "SELECT id, nombre, email, tipo, estado, created_at FROM usuarios WHERE id = ?",
      [userId]
    );

    return NextResponse.json(
      { 
        message: 'Usuario creado exitosamente',
        user: newUser[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
