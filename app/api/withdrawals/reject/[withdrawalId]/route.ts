import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { withdrawals, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { validateWithdrawalToken } from "@/lib/withdrawal-token";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateWithdrawalRejectedEmailHTML } from '../../email-templates';
import { getSessionUser } from "@/lib/auth/session";

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

type RouteParams = {
  params: Promise<{
    withdrawalId: string;
  }>;
};

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { withdrawalId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !validateWithdrawalToken(withdrawalId, token)) {
      return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=invalid_token', request.url));
    }

    const adminUser = await getSessionUser();
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?redirect=/admin/transactions&error=admin_required', request.url));
    }

    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.withdrawalId, withdrawalId))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=not_found', request.url));
    }

    if (withdrawal.status === 'completed') {
      return NextResponse.redirect(new URL(`/admin/result?type=withdrawal&action=reject&status=already_completed&id=${withdrawalId}`, request.url));
    }

    if (withdrawal.status === 'rejected') {
      return NextResponse.redirect(new URL(`/admin/result?type=withdrawal&action=reject&status=already_rejected&id=${withdrawalId}`, request.url));
    }

    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email, saldo: users.saldo })
      .from(users)
      .where(eq(users.id, withdrawal.userId))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=user_not_found', request.url));
    }

    const sql = neon(getDatabaseUrl());
    const rejectedAt = new Date();
    const refundAmount = Number(withdrawal.amount);

    await sql`BEGIN`;

    try {
      const updateResult = await sql`
        UPDATE withdrawals 
        SET status = 'rejected', completed_at = ${rejectedAt.toISOString()}
        WHERE withdrawal_id = ${withdrawalId} AND status = 'pending'
        RETURNING withdrawal_id
      `;

      if (updateResult.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.redirect(new URL(`/admin/result?type=withdrawal&action=reject&status=already_processed&id=${withdrawalId}`, request.url));
      }

      await sql`
        UPDATE users 
        SET saldo = saldo + ${refundAmount}, updated_at = ${rejectedAt.toISOString()}
        WHERE id = ${user.id}
      `;

      await sql`COMMIT`;

      console.log(`Withdrawal ${withdrawalId} rejected - Refunded ${refundAmount} to user ${user.id}`);
    } catch (txError) {
      await sql`ROLLBACK`;
      throw txError;
    }

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Penarikan #${withdrawalId} Ditolak`;
      sendSmtpEmail.htmlContent = generateWithdrawalRejectedEmailHTML({
        withdrawalId,
        userName: user.name,
        amount: refundAmount,
        method: withdrawal.method,
        bankCode: withdrawal.bankCode,
        accountName: withdrawal.accountName,
        accountNumber: withdrawal.accountNumber,
        rejectedAt,
      });
      sendSmtpEmail.sender = { name: "Saldopedia", email: "service.transaksi@saldopedia.com" };
      sendSmtpEmail.to = [{ email: user.email, name: user.name }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Withdrawal rejection email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Error sending withdrawal rejection email:", emailError);
    }

    return NextResponse.redirect(new URL(`/admin/result?type=withdrawal&action=reject&status=success&id=${withdrawalId}`, request.url));
    
  } catch (error) {
    console.error("Withdrawal rejection error:", error);
    return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=server_error', request.url));
  }
}
