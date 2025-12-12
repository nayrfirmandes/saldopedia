import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq, and, ne, or } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { otp } = body;

    if (!otp || typeof otp !== 'string' || otp.length !== 6) {
      return NextResponse.json(
        { success: false, error: 'Kode OTP harus 6 digit' },
        { status: 400 }
      );
    }

    const sql = neon(getDatabaseUrl());
    const db = drizzle(sql);

    const [currentUser] = await db
      .select({ 
        phoneVerificationCode: users.phoneVerificationCode,
        phoneVerificationCodeExpiresAt: users.phoneVerificationCodeExpiresAt,
        pendingPhone: users.pendingPhone,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!currentUser?.phoneVerificationCode || !currentUser?.phoneVerificationCodeExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada kode OTP yang aktif' },
        { status: 400 }
      );
    }

    if (!currentUser?.pendingPhone) {
      return NextResponse.json(
        { success: false, error: 'Tidak ada nomor HP yang menunggu verifikasi' },
        { status: 400 }
      );
    }

    if (new Date() > new Date(currentUser.phoneVerificationCodeExpiresAt)) {
      return NextResponse.json(
        { success: false, error: 'Kode OTP sudah kadaluarsa' },
        { status: 400 }
      );
    }

    if (otp !== currentUser.phoneVerificationCode) {
      return NextResponse.json(
        { success: false, error: 'Kode OTP tidak valid' },
        { status: 400 }
      );
    }

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          ne(users.id, user.id),
          or(
            eq(users.phone, currentUser.pendingPhone!),
            eq(users.pendingPhone, currentUser.pendingPhone!)
          )
        )
      )
      .limit(1);

    if (existingUser) {
      await db
        .update(users)
        .set({
          pendingPhone: null,
          phoneVerificationCode: null,
          phoneVerificationCodeExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return NextResponse.json(
        { success: false, error: 'Nomor HP sudah digunakan oleh pengguna lain' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        phone: currentUser.pendingPhone,
        phoneVerified: true,
        pendingPhone: null,
        phoneVerificationCode: null,
        phoneVerificationCodeExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: 'Nomor HP berhasil diverifikasi',
    });
  } catch (error) {
    console.error('Error verifying phone OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
