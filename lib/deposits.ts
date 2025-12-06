import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());

export type Deposit = {
  id: number;
  deposit_id: string;
  user_id: number;
  amount: string;
  fee: string;
  unique_code: number;
  total_amount: string;
  method: string;
  bank_code: string | null;
  status: 'pending' | 'pending_proof' | 'completed' | 'rejected' | 'expired';
  admin_notes: string | null;
  created_at: Date | string;
  completed_at: Date | string | null;
  expires_at: Date | string | null;
};

export const getDepositById = async (depositId: string): Promise<Deposit | null> => {
  const result = await sql`
    SELECT * FROM deposits WHERE deposit_id = ${depositId}
  `;
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0] as Deposit;
};

export const getLatestDepositsForUser = async (userId: number, limit: number = 10) => {
  const result = await sql`
    SELECT * FROM deposits 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  
  return result as Deposit[];
};

export const getCachedLatestDepositsForUser = getLatestDepositsForUser;
