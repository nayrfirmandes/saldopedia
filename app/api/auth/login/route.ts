import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, orders } from '@/shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth/password';
import { createSession, getSessionCookieOptions } from '@/lib/auth/session';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email belum terdaftar. Silakan daftar terlebih dahulu.' },
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { success: false, error: 'Akun ini terdaftar menggunakan Google. Silakan login dengan Google.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email belum diverifikasi. Silakan cek email Anda.' },
        { status: 403 }
      );
    }

    // Auto-link guest orders for existing users (legacy backfill)
    try {
      await db
        .update(orders)
        .set({ userId: user.id })
        .where(
          and(
            eq(orders.customerEmail, email.toLowerCase()),
            isNull(orders.userId)
          )
        );
      console.log(`Auto-linked any existing guest orders to user ${user.id} (${email})`);
    } catch (linkError) {
      console.error('Error linking guest orders on login:', linkError);
      // Continue login even if linking fails
    }

    const { token, expiresAt } = await createSession(user.id);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        saldo: user.saldo,
        role: user.role,
      },
    });

    response.cookies.set('saldopedia_session', token, getSessionCookieOptions(expiresAt));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
