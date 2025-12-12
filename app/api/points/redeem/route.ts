import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { redeemPoints, MIN_REDEEM_POINTS } from '@/lib/points';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
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

    const sql = neon(getDatabaseUrl());
    const db = drizzle(sql);

    const [dbUser] = await db
      .select({ 
        emailVerified: users.emailVerified,
        phoneVerified: users.phoneVerified,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!dbUser?.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email harus diverifikasi terlebih dahulu' },
        { status: 403 }
      );
    }

    if (!dbUser?.phoneVerified) {
      return NextResponse.json(
        { success: false, error: 'Nomor HP harus diverifikasi terlebih dahulu' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { points } = body;

    if (!points || typeof points !== 'number' || points < MIN_REDEEM_POINTS) {
      return NextResponse.json(
        { success: false, error: `Minimum penukaran ${MIN_REDEEM_POINTS.toLocaleString()} poin` },
        { status: 400 }
      );
    }

    const result = await redeemPoints(user.id, points);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.newBalance,
    });

  } catch (error) {
    console.error('Redeem points error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
