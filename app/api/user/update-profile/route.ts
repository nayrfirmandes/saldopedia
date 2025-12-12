import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, phone, photoUrl } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi' }, { status: 400 });
    }

    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const userData = currentUser[0];
    const isGoogleUser = !!userData.googleId;
    const hasChangedName = userData.nameChanged;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== user.id) {
      return NextResponse.json({ error: 'Email sudah digunakan' }, { status: 400 });
    }

    const updateData: {
      email: string;
      phone: string | null;
      photoUrl: string | null;
      name?: string;
      nameChanged?: boolean;
      emailVerified?: boolean;
      phoneVerified?: boolean;
      phoneVerificationCode?: string | null;
      phoneVerificationCodeExpiresAt?: Date | null;
    } = {
      email,
      phone: phone || null,
      photoUrl: photoUrl || null,
    };

    const emailChanged = email.toLowerCase() !== userData.email.toLowerCase();
    if (emailChanged) {
      updateData.emailVerified = false;
    }

    const phoneChanged = (phone || null) !== userData.phone;
    if (phoneChanged) {
      updateData.phoneVerified = false;
      updateData.phoneVerificationCode = null;
      updateData.phoneVerificationCodeExpiresAt = null;
    }

    if (name && name !== userData.name) {
      if (isGoogleUser && !hasChangedName) {
        updateData.name = name;
        updateData.nameChanged = true;
      } else if (!isGoogleUser) {
      }
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
