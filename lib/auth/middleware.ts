import { NextResponse } from 'next/server';
import { getSessionUser, SessionUser } from './session';

export async function requireAuth(): Promise<SessionUser> {
  const user = await getSessionUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }
  
  return user;
}

export async function requireEmailVerified(): Promise<SessionUser> {
  const user = await requireAuth();
  
  if (!user.emailVerified) {
    throw new Error('Email belum diverifikasi');
  }
  
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  
  if (user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  
  return user;
}
