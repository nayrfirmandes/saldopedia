import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import { getDepositConfirmUrl, getDepositRejectUrl } from "@/lib/deposit-token";
import { getWithdrawalCompleteUrl, getWithdrawalRejectUrl } from "@/lib/withdrawal-token";
import { getCompletionUrl, getRejectUrl } from "@/lib/order-token";

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      console.log("Admin check: No user session found");
      return NextResponse.json(
        { error: "Unauthorized - not logged in" },
        { status: 401 }
      );
    }

    if (user.role !== 'admin') {
      console.log("Admin check: User role is not admin:", user.role);
      return NextResponse.json(
        { error: "Unauthorized - not admin" },
        { status: 401 }
      );
    }

    const sql = neon(getDatabaseUrl());

    const [depositsRaw, withdrawalsRaw, ordersRaw, transfersRaw] = await Promise.all([
      sql`
        SELECT 
          d.deposit_id,
          d.user_id,
          u.name as user_name,
          u.email as user_email,
          d.amount,
          d.fee,
          d.total_amount,
          d.method,
          d.bank_code,
          d.status,
          d.created_at,
          d.completed_at
        FROM deposits d
        JOIN users u ON d.user_id = u.id
        ORDER BY d.created_at DESC
        LIMIT 500
      `,
      sql`
        SELECT 
          w.withdrawal_id,
          w.user_id,
          u.name as user_name,
          u.email as user_email,
          w.amount,
          w.fee,
          w.net_amount,
          w.method,
          w.bank_code,
          w.account_name,
          w.account_number,
          w.status,
          w.created_at,
          w.completed_at
        FROM withdrawals w
        JOIN users u ON w.user_id = u.id
        ORDER BY w.created_at DESC
        LIMIT 500
      `,
      sql`
        SELECT 
          o.order_id,
          o.user_id,
          u.name as user_name,
          u.email as user_email,
          o.service_type,
          o.crypto_symbol,
          o.transaction_type,
          o.amount_input,
          o.amount_idr,
          o.wallet_address,
          o.paypal_email,
          o.skrill_email,
          o.status,
          o.created_at
        FROM orders o
        JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
        LIMIT 500
      `,
      sql`
        SELECT 
          t.transfer_id,
          t.sender_id,
          t.receiver_id,
          t.amount,
          t.notes,
          t.created_at,
          sender.name as sender_name,
          sender.email as sender_email,
          receiver.name as receiver_name,
          receiver.email as receiver_email
        FROM saldo_transfers t
        JOIN users sender ON t.sender_id = sender.id
        JOIN users receiver ON t.receiver_id = receiver.id
        ORDER BY t.created_at DESC
        LIMIT 500
      `,
    ]);

    const deposits = depositsRaw.map(d => ({
      ...d,
      confirmUrl: d.status === 'pending' ? getDepositConfirmUrl(d.deposit_id) : null,
      rejectUrl: d.status === 'pending' ? getDepositRejectUrl(d.deposit_id) : null,
    }));

    const withdrawals = withdrawalsRaw.map(w => ({
      ...w,
      completeUrl: w.status === 'pending' ? getWithdrawalCompleteUrl(w.withdrawal_id) : null,
      rejectUrl: w.status === 'pending' ? getWithdrawalRejectUrl(w.withdrawal_id) : null,
    }));

    const orders = ordersRaw.map(o => ({
      ...o,
      completeUrl: ['pending', 'confirmed', 'processing'].includes(o.status) ? getCompletionUrl(o.order_id) : null,
      rejectUrl: ['pending', 'confirmed', 'processing'].includes(o.status) ? getRejectUrl(o.order_id) : null,
    }));

    const transfers = transfersRaw.map(t => ({
      transfer_id: t.transfer_id,
      sender_id: t.sender_id,
      receiver_id: t.receiver_id,
      amount: t.amount,
      notes: t.notes,
      created_at: t.created_at,
      sender_name: t.sender_name,
      sender_email: t.sender_email,
      receiver_name: t.receiver_name,
      receiver_email: t.receiver_email,
    }));

    return NextResponse.json({
      deposits,
      withdrawals,
      orders,
      transfers,
    });

  } catch (error) {
    console.error("Admin pending transactions error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
