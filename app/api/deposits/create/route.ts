import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as Brevo from "@getbrevo/brevo";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import { getDepositConfirmUrl } from "@/lib/deposit-token";
import { generateDepositAdminEmailHTML, generateDepositUserRequestEmailHTML } from "../email-templates";
import { getAdminPaymentConfig } from "@/lib/payment-config";

function getTargetAccountInfo(method: string, bankCode: string) {
  const config = getAdminPaymentConfig();
  if (method === 'bank_transfer') {
    const bank = config.bankAccounts.find(b => b.bank === bankCode);
    if (bank) {
      return { name: bank.accountName, number: bank.accountNumber };
    }
  } else if (method === 'ewallet') {
    const wallet = config.ewallets.find(w => w.provider === bankCode);
    if (wallet) {
      return { name: wallet.accountName, number: wallet.phoneNumber };
    }
  }
  return { name: 'Saldopedia', number: bankCode };
}

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "hopshitmeme@gmail.com";
const MIN_DEPOSIT = 25000;
const MAX_DEPOSIT = 5000000;
const DEPOSIT_FEE = 1500;
const UNIQUE_CODE_MIN = 100;
const UNIQUE_CODE_MAX = 300;
const DEPOSIT_EXPIRY_HOURS = 1;

function generateUniqueCode(): number {
  return Math.floor(Math.random() * (UNIQUE_CODE_MAX - UNIQUE_CODE_MIN + 1)) + UNIQUE_CODE_MIN;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, method, bankCode } = body;

    if (!amount || !method || !bankCode) {
      return NextResponse.json(
        { success: false, error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum < MIN_DEPOSIT) {
      return NextResponse.json(
        { success: false, error: `Minimum deposit Rp ${MIN_DEPOSIT.toLocaleString('id-ID')}` },
        { status: 400 }
      );
    }

    if (amountNum > MAX_DEPOSIT) {
      return NextResponse.json(
        { success: false, error: `Maksimum deposit Rp ${MAX_DEPOSIT.toLocaleString('id-ID')}` },
        { status: 400 }
      );
    }

    if (!['bank_transfer', 'ewallet'].includes(method)) {
      return NextResponse.json(
        { success: false, error: "Metode deposit tidak valid" },
        { status: 400 }
      );
    }

    const recentDeposits = await sql`
      SELECT deposit_id FROM deposits 
      WHERE user_id = ${user.id} 
        AND amount = ${amountNum}
        AND method = ${method}
        AND status IN ('pending', 'pending_proof')
        AND created_at > NOW() - INTERVAL '2 minutes'
      LIMIT 1
    `;

    if (recentDeposits.length > 0) {
      return NextResponse.json(
        { success: false, error: "Deposit serupa sudah dibuat dalam 2 menit terakhir. Silakan cek halaman deposit Anda." },
        { status: 429 }
      );
    }

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const depositId = `DEP-${timestamp}-${random}`.toUpperCase();

    const expiresAt = new Date(Date.now() + DEPOSIT_EXPIRY_HOURS * 60 * 60 * 1000);

    const uniqueCode = generateUniqueCode();
    const fee = DEPOSIT_FEE;
    const totalAmount = amountNum + fee + uniqueCode;

    const targetAccount = getTargetAccountInfo(method, bankCode);

    await sql`
      INSERT INTO deposits (
        deposit_id,
        user_id,
        amount,
        fee,
        unique_code,
        total_amount,
        method,
        bank_code,
        status,
        expires_at
      ) VALUES (
        ${depositId},
        ${user.id},
        ${amountNum},
        ${fee},
        ${uniqueCode},
        ${totalAmount},
        ${method},
        ${bankCode},
        'pending_proof',
        ${expiresAt.toISOString()}
      )
    `;

    console.log(`Deposit ${depositId} created (pending proof) for user ${user.id}`);
    console.log(`   Amount: Rp ${amountNum.toLocaleString('id-ID')}`);
    console.log(`   Fee: Rp ${fee.toLocaleString('id-ID')}`);
    console.log(`   Unique Code: Rp ${uniqueCode}`);
    console.log(`   Total: Rp ${totalAmount.toLocaleString('id-ID')}`);
    console.log(`   Method: ${method} (${bankCode})`);

    // Send email to user with deposit instructions
    try {
      const userEmail = new Brevo.SendSmtpEmail();
      userEmail.subject = `Instruksi Deposit #${depositId} - Saldopedia`;
      userEmail.htmlContent = generateDepositUserRequestEmailHTML({
        depositId,
        userName: user.name,
        amount: amountNum,
        fee,
        uniqueCode,
        totalAmount,
        method,
        bankCode,
        targetAccount,
        createdAt: new Date(),
      });
      userEmail.sender = { 
        name: "Saldopedia", 
        email: "service.transaksi@saldopedia.com" 
      };
      userEmail.to = [{ 
        email: user.email, 
        name: user.name 
      }];

      await apiInstance.sendTransacEmail(userEmail);
      console.log(`Deposit instruction email sent to ${user.email}`);
    } catch (emailError) {
      console.error("Error sending deposit instruction email:", emailError);
    }

    return NextResponse.json({
      success: true,
      depositId,
      amount: amountNum,
      fee,
      uniqueCode,
      totalAmount,
      method,
      bankCode,
      targetAccount,
      expiresAt: expiresAt.toISOString(),
      message: "Deposit request berhasil dibuat. Silakan transfer dan upload bukti.",
    });

  } catch (error) {
    console.error("Deposit creation error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
