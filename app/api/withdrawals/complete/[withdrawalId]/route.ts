import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { withdrawals, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { validateWithdrawalToken } from "@/lib/withdrawal-token";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateWithdrawalCompletedEmailHTML } from '../../email-templates';

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

    const [withdrawal] = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.withdrawalId, withdrawalId))
      .limit(1);

    if (!withdrawal) {
      return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=not_found', request.url));
    }

    if (withdrawal.status === 'completed') {
      return NextResponse.redirect(new URL(`/withdrawal/complete/success?withdrawalId=${withdrawalId}&already_completed=true`, request.url));
    }

    if (withdrawal.status === 'rejected') {
      return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=rejected', request.url));
    }

    const [user] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.id, withdrawal.userId))
      .limit(1);

    if (!user) {
      return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=user_not_found', request.url));
    }

    await db
      .update(withdrawals)
      .set({
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(withdrawals.withdrawalId, withdrawalId));

    try {
      await sendCompletionEmail(withdrawal, user);
      console.log(`Withdrawal completion email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Error sending withdrawal completion email:", emailError);
    }

    return NextResponse.redirect(new URL(`/withdrawal/complete/success?withdrawalId=${withdrawalId}`, request.url));
    
  } catch (error) {
    console.error("Withdrawal completion error:", error);
    return NextResponse.redirect(new URL('/withdrawal/complete/error?reason=server_error', request.url));
  }
}

async function sendCompletionEmail(withdrawal: typeof withdrawals.$inferSelect, user: { name: string; email: string }) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();
  const completedAt = new Date();

  sendSmtpEmail.subject = `Penarikan #${withdrawal.withdrawalId} Berhasil Diproses`;
  sendSmtpEmail.htmlContent = generateWithdrawalCompletedEmailHTML({
    withdrawalId: withdrawal.withdrawalId,
    userName: user.name,
    netAmount: Number(withdrawal.netAmount),
    method: withdrawal.method,
    bankCode: withdrawal.bankCode,
    accountName: withdrawal.accountName,
    accountNumber: withdrawal.accountNumber,
    completedAt: completedAt
  });
  sendSmtpEmail.sender = { name: "Saldopedia", email: "service.transaksi@saldopedia.com" };
  sendSmtpEmail.to = [{ email: user.email, name: user.name }];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}
