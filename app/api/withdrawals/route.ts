import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { withdrawals, users } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';
import { getSessionUser, getSessionToken } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateWithdrawalUserEmailHTML, generateWithdrawalAdminEmailHTML } from "./email-templates";
import { getWithdrawalCompleteUrl, getWithdrawalRejectUrl } from "@/lib/withdrawal-token";
import { 
  extractSecurityContext, 
  checkTransactionSecurity, 
  logTransactionSecurity,
  sleep,
  type BrowserFingerprintData,
  type SecurityContext
} from "@/lib/security/transaction-security";

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "hopshitmeme@gmail.com";

function generateWithdrawalId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WD${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sessionToken = await getSessionToken();
    const baseContext = extractSecurityContext(request, sessionToken || 'unknown');

    const data = await request.json();
    const { amount, method, bankCode, accountName, accountNumber, browserFingerprint } = data;

    const securityContext: SecurityContext = {
      ...baseContext,
      browserFingerprint: browserFingerprint as BrowserFingerprintData | undefined,
    };

    if (!amount || !method || !accountName || !accountNumber) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    if (!bankCode) {
      return NextResponse.json(
        { error: method === 'bank_transfer' ? "Kode bank diperlukan" : "Kode e-wallet diperlukan" },
        { status: 400 }
      );
    }

    const withdrawalAmount = Number(amount);
    const minimumWithdraw = 50000;
    const FEE_THRESHOLD = 1000000;
    const WITHDRAWAL_FEE = 17000;

    if (isNaN(withdrawalAmount) || withdrawalAmount < minimumWithdraw) {
      return NextResponse.json(
        { error: `Minimum penarikan Rp ${minimumWithdraw.toLocaleString('id-ID')}` },
        { status: 400 }
      );
    }

    const securityCheck = await checkTransactionSecurity(
      user.id,
      'withdrawal',
      withdrawalAmount,
      securityContext
    );

    if (!securityCheck.allowed) {
      await logTransactionSecurity(
        user.id,
        'withdrawal',
        'BLOCKED',
        withdrawalAmount,
        securityContext,
        'blocked',
        securityCheck.error,
        { geoData: securityCheck.geoData, riskLevel: securityCheck.riskLevel }
      );
      return NextResponse.json(
        { error: securityCheck.error },
        { status: 429 }
      );
    }

    if (securityCheck.requiresDelay) {
      await sleep(securityCheck.delayMs);
    }

    const fee = withdrawalAmount < FEE_THRESHOLD ? WITHDRAWAL_FEE : 0;
    const netAmount = withdrawalAmount - fee;
    const withdrawalId = generateWithdrawalId();
    const createdAt = new Date();

    const sql = neon(getDatabaseUrl());

    const recentWithdrawals = await sql`
      SELECT withdrawal_id FROM withdrawals 
      WHERE user_id = ${user.id} 
        AND amount = ${withdrawalAmount}
        AND status = 'pending'
        AND created_at > NOW() - INTERVAL '2 minutes'
      LIMIT 1
    `;

    if (recentWithdrawals.length > 0) {
      return NextResponse.json(
        { error: "Penarikan serupa sudah dibuat dalam 2 menit terakhir. Silakan cek halaman penarikan Anda." },
        { status: 429 }
      );
    }
    
    await sql`BEGIN`;
    
    try {
      const result = await sql`
        UPDATE users 
        SET saldo = saldo - ${withdrawalAmount}, updated_at = ${createdAt.toISOString()}
        WHERE id = ${user.id} AND saldo >= ${withdrawalAmount}
        RETURNING saldo
      `;

      if (result.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.json(
          { error: "Saldo tidak mencukupi" },
          { status: 400 }
        );
      }

      await sql`
        INSERT INTO withdrawals (
          withdrawal_id, user_id, amount, fee, net_amount,
          method, bank_code, account_name, account_number,
          status, created_at
        ) VALUES (
          ${withdrawalId}, ${user.id}, ${withdrawalAmount}, ${fee}, ${netAmount},
          ${method}, ${bankCode}, ${accountName}, ${accountNumber},
          'pending', ${createdAt.toISOString()}
        )
      `;

      await sql`COMMIT`;

      const newSaldo = parseFloat(result[0].saldo?.toString() || "0");

      await logTransactionSecurity(
        user.id,
        'withdrawal',
        withdrawalId,
        withdrawalAmount,
        securityContext,
        'success',
        undefined,
        { geoData: securityCheck.geoData, riskLevel: securityCheck.riskLevel }
      );

      try {
        const userEmail = new Brevo.SendSmtpEmail();
        userEmail.subject = `Permintaan Penarikan #${withdrawalId} Diterima`;
        userEmail.htmlContent = generateWithdrawalUserEmailHTML({
          withdrawalId,
          userName: user.name,
          amount: withdrawalAmount,
          fee,
          netAmount,
          method,
          bankCode,
          accountName,
          accountNumber,
          createdAt,
        });
        userEmail.sender = { name: "Saldopedia", email: "service.transaksi@saldopedia.com" };
        userEmail.to = [{ email: user.email, name: user.name }];

        const completeUrl = getWithdrawalCompleteUrl(withdrawalId);
        const rejectUrl = getWithdrawalRejectUrl(withdrawalId);

        const adminEmail = new Brevo.SendSmtpEmail();
        adminEmail.subject = `[WITHDRAWAL] Penarikan Baru #${withdrawalId} - ${user.name}`;
        adminEmail.htmlContent = generateWithdrawalAdminEmailHTML({
          withdrawalId,
          userName: user.name,
          userEmail: user.email,
          userPhone: user.phone || null,
          amount: withdrawalAmount,
          fee,
          netAmount,
          method,
          bankCode,
          accountName,
          accountNumber,
          createdAt,
          completeUrl,
          rejectUrl,
        });
        adminEmail.sender = { name: "Saldopedia System", email: "service.transaksi@saldopedia.com" };
        adminEmail.to = [{ email: ADMIN_EMAIL, name: "Admin Saldopedia" }];

        await Promise.all([
          apiInstance.sendTransacEmail(userEmail),
          apiInstance.sendTransacEmail(adminEmail),
        ]);
        console.log(`Withdrawal emails sent for ${withdrawalId}:`);
        console.log(`   User: ${user.email}`);
        console.log(`   Admin: ${ADMIN_EMAIL}`);
      } catch (emailError) {
        console.error("Error sending withdrawal emails:", emailError);
      }

      console.log(`Withdrawal ${withdrawalId} created:`);
      console.log(`   User ${user.id}: deducted ${withdrawalAmount}, new saldo: ${newSaldo}`);
      console.log(`   IP: ${securityContext.ipAddress}, Risk: ${securityCheck.riskLevel}`);

      return NextResponse.json({
        success: true,
        withdrawalId,
        message: "Permintaan penarikan berhasil dibuat",
        newSaldo
      });

    } catch (txError) {
      await sql`ROLLBACK`;
      throw txError;
    }

  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWithdrawals = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, user.id))
      .orderBy(desc(withdrawals.createdAt))
      .limit(50);

    return NextResponse.json({ withdrawals: userWithdrawals });

  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
