import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from "@/lib/db-url";

export interface PointTransaction {
  id: number;
  type: 'referral_bonus' | 'referred_bonus' | 'redeem' | 'expired' | 'adjustment';
  amount: number;
  description: string | null;
  createdAt: string;
}

export interface PointsHistory {
  currentBalance: number;
  transactions: PointTransaction[];
}

export interface PointTransactionDetail {
  id: number;
  type: 'referral_bonus' | 'referred_bonus' | 'redeem' | 'expired' | 'adjustment';
  amount: number;
  description: string | null;
  createdAt: string;
  referralInfo?: {
    referredUserName: string;
    referredUserEmail: string;
  } | null;
}

export async function getPointTransactionDetail(transactionId: number, userId: number): Promise<PointTransactionDetail | null> {
  const sql = neon(getDatabaseUrl());
  
  const [transaction] = await sql`
    SELECT 
      pt.id, pt.type, pt.amount, pt.description, pt.created_at, pt.referral_id
    FROM point_transactions pt
    WHERE pt.id = ${transactionId} AND pt.user_id = ${userId}
  `;
  
  if (!transaction) {
    return null;
  }

  let referralInfo = null;
  
  if (transaction.referral_id) {
    const [referral] = await sql`
      SELECT r.id, u.name, u.email
      FROM referrals r
      JOIN users u ON r.referred_id = u.id
      WHERE r.id = ${transaction.referral_id}
    `;
    
    if (referral) {
      referralInfo = {
        referredUserName: referral.name,
        referredUserEmail: referral.email,
      };
    }
  }

  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    description: transaction.description,
    createdAt: new Date(transaction.created_at).toISOString(),
    referralInfo,
  };
}

export async function getPointsHistory(userId: number): Promise<PointsHistory> {
  const sql = neon(getDatabaseUrl());
  
  const [user] = await sql`SELECT points FROM users WHERE id = ${userId}`;
  
  const transactions = await sql`
    SELECT id, type, amount, description, created_at
    FROM point_transactions
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 50
  `;

  return {
    currentBalance: user?.points || 0,
    transactions: transactions.map((t: any) => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      createdAt: new Date(t.created_at).toISOString(),
    })),
  };
}

export const POINTS_TO_IDR_RATE = 0.5;
export const MIN_REDEEM_POINTS = 100000;

export async function redeemPoints(userId: number, pointsToRedeem: number): Promise<{ success: boolean; error?: string; newBalance?: number }> {
  const sql = neon(getDatabaseUrl());
  
  if (pointsToRedeem < MIN_REDEEM_POINTS) {
    return { success: false, error: `Minimum penukaran ${MIN_REDEEM_POINTS.toLocaleString()} poin` };
  }

  const [user] = await sql`SELECT points, saldo FROM users WHERE id = ${userId} FOR UPDATE`;
  
  if (!user || user.points < pointsToRedeem) {
    return { success: false, error: 'Poin tidak mencukupi' };
  }

  const idrAmount = pointsToRedeem * POINTS_TO_IDR_RATE;

  await sql`
    UPDATE users 
    SET points = points - ${pointsToRedeem}, 
        saldo = saldo + ${idrAmount},
        updated_at = NOW()
    WHERE id = ${userId}
  `;

  await sql`
    INSERT INTO point_transactions (user_id, type, amount, description, created_at)
    VALUES (${userId}, 'redeem', ${-pointsToRedeem}, NULL, NOW())
  `;

  const [updatedUser] = await sql`SELECT points FROM users WHERE id = ${userId}`;

  return { success: true, newBalance: updatedUser.points };
}
