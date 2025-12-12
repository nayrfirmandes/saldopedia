import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

// Force dynamic to prevent caching user profile data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getSessionUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lookupEmail = searchParams.get('email');

    if (lookupEmail) {
      if (lookupEmail.toLowerCase() === currentUser.email.toLowerCase()) {
        return NextResponse.json(
          { success: false, error: 'Tidak dapat transfer ke diri sendiri' },
          { status: 400 }
        );
      }

      const [foundUser] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          photoUrl: users.photoUrl,
        })
        .from(users)
        .where(eq(users.email, lookupEmail.toLowerCase()))
        .limit(1);

      if (!foundUser) {
        return NextResponse.json(
          { success: false, error: 'Pengguna tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        user: {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          photoUrl: foundUser.photoUrl,
        },
      }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        photoUrl: currentUser.photoUrl,
        saldo: currentUser.saldo,
        role: currentUser.role,
      },
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, phone } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Nama harus diisi' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        name,
        phone: phone || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    return NextResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
