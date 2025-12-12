import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as Brevo from "@getbrevo/brevo";
import { validateDepositToken } from "@/lib/deposit-token";
import { getDatabaseUrl } from "@/lib/db-url";
import { generateDepositUserConfirmEmailHTML } from "../../email-templates";
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
      return NextResponse.redirect(new URL(`/deposit/success?depositId=${depositId}&already_completed=true`, request.url));
    }

    if (deposit.status === 'expired' || deposit.status === 'rejected') {
      return NextResponse.redirect(new URL(`/deposit/error?reason=${deposit.status}`, request.url));
    }

    if (new Date(deposit.expires_at) < new Date()) {
      await sql`
        UPDATE deposits 
        SET status = 'expired'
        WHERE deposit_id = ${depositId} AND status IN ('pending', 'pending_proof')
      `;
      return NextResponse.redirect(new URL('/deposit/error?reason=expired', request.url));
    }

    const depositAmount = parseFloat(deposit.amount);
    const completedAt = new Date();

    await sql`BEGIN`;
    
    try {
      const updateDeposit = await sql`
        UPDATE deposits 
        SET status = 'completed', completed_at = ${completedAt.toISOString()}
        WHERE deposit_id = ${depositId} AND status IN ('pending', 'pending_proof')
        RETURNING deposit_id, amount
      `;

      if (updateDeposit.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.redirect(new URL(`/deposit/success?depositId=${depositId}&already_completed=true`, request.url));
      }

      const updateUser = await sql`
        UPDATE users 
        SET saldo = saldo + ${depositAmount}, updated_at = ${completedAt.toISOString()}
        WHERE id = ${deposit.user_id}
        RETURNING saldo
      `;

      await sql`COMMIT`;

      const newSaldo = parseFloat(updateUser[0]?.saldo || '0');

      try {
        const sendSmtpEmail = new Brevo.SendSmtpEmail();
        sendSmtpEmail.subject = `Deposit Berhasil - ${depositId}`;
        sendSmtpEmail.htmlContent = generateDepositUserConfirmEmailHTML({
          depositId,
          userName: deposit.user_name,
          amount: depositAmount,
          method: deposit.method,
          bankCode: deposit.bank_code,
          completedAt,
          newSaldo,
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
        console.log(`Deposit confirmation email sent to ${deposit.user_email}`);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      console.log(`Deposit ${depositId} confirmed`);
      console.log(`   User ${deposit.user_id}: credited ${depositAmount}, new saldo: ${newSaldo}`);

      return NextResponse.redirect(new URL(`/deposit/success?depositId=${depositId}`, request.url));

    } catch (txError) {
      await sql`ROLLBACK`;
      throw txError;
    }

  } catch (error) {
    console.error("Deposit confirmation error:", error);
    return NextResponse.redirect(new URL('/deposit/error?reason=server_error', request.url));
  }
}
