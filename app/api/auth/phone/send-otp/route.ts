import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq, and, ne, or } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';
import { generateOTP, sendOTP } from '@/lib/fonnte';

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
    const { phone } = body;

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Nomor HP diperlukan' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '');
    if (!/^(\+62|62|0)8[1-9][0-9]{7,10}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'Format nomor HP tidak valid' },
        { status: 400 }
      );
    }

    const sql = neon(getDatabaseUrl());
    const db = drizzle(sql);

    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          ne(users.id, user.id),
          or(
            eq(users.phone, cleanPhone),
            eq(users.pendingPhone, cleanPhone)
          )
        )
      )
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Nomor HP sudah digunakan oleh pengguna lain' },
        { status: 400 }
      );
    }

    const [currentUser] = await db
      .select({ 
        phone: users.phone,
        phoneVerificationCodeExpiresAt: users.phoneVerificationCodeExpiresAt 
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (currentUser?.phoneVerificationCodeExpiresAt) {
      const lastSent = new Date(currentUser.phoneVerificationCodeExpiresAt);
      const cooldownEnd = new Date(lastSent.getTime() - 4 * 60 * 1000);
      if (new Date() < cooldownEnd) {
        const waitSeconds = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
        return NextResponse.json(
          { success: false, error: `Tunggu ${waitSeconds} detik sebelum mengirim ulang` },
          { status: 429 }
        );
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await db
      .update(users)
      .set({
        pendingPhone: cleanPhone,
        phoneVerificationCode: otp,
        phoneVerificationCodeExpiresAt: expiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const result = await sendOTP(cleanPhone, otp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Gagal mengirim OTP' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP berhasil dikirim',
    });
  } catch (error) {
    console.error('Error sending phone OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
