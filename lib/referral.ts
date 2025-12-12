import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from "@/lib/db-url";

export function generateReferralCode(name: string, id: number): string {
  const cleanName = name.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 4);
  const suffix = id.toString().slice(-4).padStart(4, '0');
  return `${cleanName || 'USER'}${suffix}`;
}

export async function ensureUserHasReferralCode(userId: number, name: string): Promise<string> {
  const sql = neon(getDatabaseUrl());
  
  const [user] = await sql`SELECT referral_code FROM users WHERE id = ${userId}`;
  
  if (user?.referral_code) {
    return user.referral_code;
  }
  
  let referralCode = generateReferralCode(name, userId);
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    try {
      await sql`UPDATE users SET referral_code = ${referralCode} WHERE id = ${userId}`;
      return referralCode;
    } catch (error: any) {
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        referralCode = `${generateReferralCode(name, userId)}${Math.random().toString(36).slice(-2).toUpperCase()}`;
        attempts++;
      } else {
        throw error;
      }
    }
  }
  
  throw new Error('Failed to generate unique referral code');
}

export async function findUserByReferralCode(referralCode: string): Promise<{ id: number; name: string; email: string } | null> {
  const sql = neon(getDatabaseUrl());
  
  const [user] = await sql`
    SELECT id, name, email 
    FROM users 
    WHERE UPPER(referral_code) = ${referralCode.toUpperCase()}
  `;
  
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email };
}
