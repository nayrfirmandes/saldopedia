import { cookies } from 'next/headers';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { sessions, users } from '@/shared/schema';
import { eq, and, gt, lt } from 'drizzle-orm';
import { generateRandomToken } from './tokens';
import { cache } from 'react';
import { unstable_cache, revalidateTag } from 'next/cache';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

const SESSION_COOKIE_NAME = 'saldopedia_session';
const SESSION_EXPIRY_DAYS = 7;

export interface SessionUser {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  photoUrl: string | null;
  saldo: string;
  role: string;
  emailVerified: boolean;
}

export interface SessionData {
  token: string;
  expiresAt: Date;
}

export async function createSession(userId: number): Promise<SessionData> {
  const token = generateRandomToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  return { token, expiresAt };
}

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    expires: expiresAt,
    path: '/',
  };
}

const lookupSession = async (token: string): Promise<SessionUser | null> => {
  const result = await db
    .select({
      userId: sessions.userId,
      email: users.email,
      name: users.name,
      phone: users.phone,
      photoUrl: users.photoUrl,
      saldo: users.saldo,
      role: users.role,
      emailVerified: users.emailVerified,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(
      and(
        eq(sessions.token, token),
        gt(sessions.expiresAt, new Date())
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const session = result[0];
  return {
    id: session.userId,
    email: session.email,
    name: session.name,
    phone: session.phone,
    photoUrl: session.photoUrl,
    saldo: session.saldo,
    role: session.role,
    emailVerified: session.emailVerified,
  };
};

const getSessionUserInternal = async (): Promise<SessionUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  // PRODUCTION FIX: Remove unstable_cache untuk instant profile updates
  // Only use React cache() for request-level deduplication
  // No cross-request caching = always fresh user data
  return lookupSession(token);
};

export const getSessionUser = cache(getSessionUserInternal);

export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await db.delete(sessions).where(eq(sessions.token, token));
    revalidateTag(`session-${token}`, 'max');
  }

  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function cleanExpiredSessions(): Promise<void> {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
