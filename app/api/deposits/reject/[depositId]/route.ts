import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as Brevo from "@getbrevo/brevo";
import { validateDepositToken } from "@/lib/deposit-token";
import { getDatabaseUrl } from "@/lib/db-url";
import { generateDepositRejectedEmailHTML } from "../../email-templates";
import { getSessionUser } from "@/lib/auth/session";

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

interface RouteParams {
  params: Promise<{
    depositId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { depositId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !validateDepositToken(depositId, token)) {
      return NextResponse.redirect(new URL('/deposit/error?reason=invalid_token', request.url));
    }

    const adminUser = await getSessionUser();
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?redirect=/admin/transactions&error=admin_required', request.url));
    }

    const deposits = await sql`
      SELECT d.*, u.email as user_email, u.name as user_name
      FROM deposits d
      JOIN users u ON d.user_id = u.id
      WHERE d.deposit_id = ${depositId}
      LIMIT 1
    `;

    if (deposits.length === 0) {
      return NextResponse.redirect(new URL('/deposit/error?reason=not_found', request.url));
    }

    const deposit = deposits[0];

    if (deposit.status === 'completed') {
      return NextResponse.redirect(new URL(`/admin/result?type=deposit&action=reject&status=already_completed&id=${depositId}`, request.url));
    }

    if (deposit.status === 'rejected') {
      return NextResponse.redirect(new URL(`/admin/result?type=deposit&action=reject&status=already_rejected&id=${depositId}`, request.url));
    }

    if (deposit.status === 'expired') {
      return NextResponse.redirect(new URL(`/admin/result?type=deposit&action=reject&status=already_expired&id=${depositId}`, request.url));
    }

    const rejectedAt = new Date();

    const updateResult = await sql`
      UPDATE deposits 
      SET status = 'rejected', completed_at = ${rejectedAt.toISOString()}
      WHERE deposit_id = ${depositId} AND status IN ('pending', 'pending_proof')
      RETURNING deposit_id, amount
    `;

    if (updateResult.length === 0) {
      return NextResponse.redirect(new URL(`/admin/result?type=deposit&action=reject&status=already_processed&id=${depositId}`, request.url));
    }

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = `Deposit Ditolak - ${depositId}`;
      sendSmtpEmail.htmlContent = generateDepositRejectedEmailHTML({
        depositId,
        userName: deposit.user_name,
        amount: parseFloat(deposit.amount),
        method: deposit.method,
        bankCode: deposit.bank_code,
        rejectedAt,
      });
      sendSmtpEmail.sender = { 
        name: "Saldopedia", 
        email: "service.transaksi@saldopedia.com" 
      };
      sendSmtpEmail.to = [{ 
        email: deposit.user_email, 
        name: deposit.user_name 
      }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Deposit rejection email sent to ${deposit.user_email}`);
    } catch (emailError) {
      console.error("Error sending rejection email:", emailError);
    }

    console.log(`Deposit ${depositId} rejected by admin`);

    return NextResponse.redirect(new URL(`/admin/result?type=deposit&action=reject&status=success&id=${depositId}`, request.url));

  } catch (error) {
    console.error("Deposit rejection error:", error);
    return NextResponse.redirect(new URL('/deposit/error?reason=server_error', request.url));
  }
}
