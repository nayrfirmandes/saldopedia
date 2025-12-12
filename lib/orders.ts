import { neon } from '@neondatabase/serverless';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());

export type Order = {
  id: number;
  order_id: string;
  user_id: number | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_type: 'paypal' | 'skrill' | 'cryptocurrency';
  crypto_symbol: string | null;
  crypto_network: string | null;
  transaction_type: 'buy' | 'sell';
  amount_input: string;
  amount_idr: string;
  rate: string;
  payment_method: string | null;
  payment_account_name: string | null;
  payment_account_number: string | null;
  wallet_address: string | null;
  xrp_tag: string | null;
  paypal_email: string | null;
  skrill_email: string | null;
  notes: string | null;
  admin_notes: string | null;
  status: 'pending' | 'pending_proof' | 'confirmed' | 'processing' | 'completed' | 'cancelled' | 'expired';
  created_at: Date | string;
  updated_at: Date | string;
  expires_at: Date | string | null;
  completed_at: Date | string | null;
  nowpayments_payment_id: string | null;
  deposit_address: string | null;
  payment_status: string | null;
  actually_paid: string | null;
  nowpayments_payout_id: string | null;
  payout_status: string | null;
  payout_hash: string | null;
  payout_error: string | null;
  proof_uploaded_at: Date | string | null;
  paid_with_saldo: boolean;
  payment_note: string | null;
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const result = await sql`
    SELECT * FROM orders WHERE order_id = ${orderId}
  `;
  
  if (result.length === 0) {
    return null;
  }
  
  return result[0] as Order;
};

export const getCachedOrderById = getOrderById;

export const getLatestOrdersForUser = async (userId: number, userEmail: string, limit: number = 10) => {
  const result = await sql`
    SELECT * FROM orders 
    WHERE user_id = ${userId} OR customer_email = ${userEmail}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  
  return result as Order[];
};

export const getCachedLatestOrdersForUser = getLatestOrdersForUser;
