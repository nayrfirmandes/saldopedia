import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { withdrawals } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getDatabaseUrl } from "@/lib/db-url";
import { cache } from 'react';

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

export const getWithdrawalById = async (withdrawalId: string) => {
  const result = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.withdrawalId, withdrawalId))
    .limit(1);

  return result[0] || null;
};

export const getCachedLatestWithdrawalsForUser = cache(async (userId: number, limit: number = 10) => {
  const userWithdrawals = await db
    .select()
    .from(withdrawals)
    .where(eq(withdrawals.userId, userId))
    .orderBy(desc(withdrawals.createdAt))
    .limit(limit);

  return userWithdrawals;
});
