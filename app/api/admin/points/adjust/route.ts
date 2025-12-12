import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - not admin" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, amount, description } = body;

    if (!userId || typeof userId !== 'number') {
      return NextResponse.json(
        { error: "User ID diperlukan" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== 'number' || amount === 0) {
      return NextResponse.json(
        { error: "Jumlah poin harus berupa angka dan tidak boleh 0" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { error: "Deskripsi diperlukan (minimal 5 karakter)" },
        { status: 400 }
      );
    }

    const sql = neon(getDatabaseUrl());

    const [targetUser] = await sql`
      SELECT id, name, email, points FROM users WHERE id = ${userId}
    `;

    if (!targetUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    if (amount < 0 && targetUser.points + amount < 0) {
      return NextResponse.json(
        { error: `Poin user tidak mencukupi. Saldo saat ini: ${targetUser.points} poin` },
        { status: 400 }
      );
    }

    await sql`
      UPDATE users 
      SET points = points + ${amount}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    await sql`
      INSERT INTO point_transactions (user_id, type, amount, description, created_at)
      VALUES (${userId}, 'adjustment', ${amount}, ${description.trim()}, NOW())
    `;

    const [updatedUser] = await sql`
      SELECT points FROM users WHERE id = ${userId}
    `;

    return NextResponse.json({
      success: true,
      message: `Berhasil ${amount > 0 ? 'menambah' : 'mengurangi'} ${Math.abs(amount).toLocaleString()} poin untuk ${targetUser.name}`,
      newBalance: updatedUser.points,
    });

  } catch (error) {
    console.error("Admin points adjust error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
