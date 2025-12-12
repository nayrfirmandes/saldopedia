import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as Brevo from "@getbrevo/brevo";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import { getDepositConfirmUrl, getDepositRejectUrl } from "@/lib/deposit-token";
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

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const depositId = formData.get('depositId') as string;
    const proofFile = formData.get('proof') as File | null;

    if (!depositId) {
      return NextResponse.json(
        { success: false, error: "Deposit ID tidak valid" },
        { status: 400 }
      );
    }

    if (!proofFile || proofFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "Bukti transfer wajib diupload" },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(proofFile.type)) {
      return NextResponse.json(
        { success: false, error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (proofFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 10MB" },
        { status: 400 }
      );
    }

    const deposits = await sql`
      SELECT * FROM deposits 
      WHERE deposit_id = ${depositId} 
      AND user_id = ${user.id}
      AND status = 'pending_proof'
    `;

    if (deposits.length === 0) {
      return NextResponse.json(
        { success: false, error: "Deposit tidak ditemukan atau sudah diproses" },
        { status: 404 }
      );
    }

    const deposit = deposits[0];

    if (new Date(deposit.expires_at) < new Date()) {
      await sql`
        UPDATE deposits SET status = 'expired' WHERE deposit_id = ${depositId}
      `;
      return NextResponse.json(
        { success: false, error: "Deposit sudah kadaluarsa" },
        { status: 400 }
      );
    }

    const updateResult = await sql`
      UPDATE deposits SET status = 'pending' 
      WHERE deposit_id = ${depositId} AND status = 'pending_proof'
      RETURNING deposit_id
    `;
    
    if (updateResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Deposit sudah diproses atau kadaluarsa" },
        { status: 400 }
      );
    }

    const confirmUrl = getDepositConfirmUrl(depositId);
    const rejectUrl = getDepositRejectUrl(depositId);

    const fileBuffer = await proofFile.arrayBuffer();
    const base64Content = Buffer.from(fileBuffer).toString('base64');

    const fileExtension = proofFile.name.split('.').pop() || 'jpg';
    const attachmentName = `bukti_transfer_${depositId}.${fileExtension}`;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Deposit Request #${depositId} - ${user.name}`;
    sendSmtpEmail.htmlContent = generateDepositAdminEmailHTML({
      depositId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      amount: Number(deposit.amount),
      fee: Number(deposit.fee),
      uniqueCode: Number(deposit.unique_code),
      totalAmount: Number(deposit.total_amount),
      method: deposit.method,
      bankCode: deposit.bank_code,
      confirmUrl,
      rejectUrl,
      createdAt: new Date(deposit.created_at),
    });
    sendSmtpEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: ADMIN_EMAIL, 
      name: "Saldopedia Admin" 
    }];
    sendSmtpEmail.attachment = [{
      content: base64Content,
      name: attachmentName,
    }];

    const targetAccount = getTargetAccountInfo(deposit.method, deposit.bank_code);
    const userEmail = new Brevo.SendSmtpEmail();
    userEmail.subject = `Deposit Request Diterima #${depositId}`;
    userEmail.htmlContent = generateDepositUserRequestEmailHTML({
      depositId,
      userName: user.name,
      amount: Number(deposit.amount),
      fee: Number(deposit.fee),
      uniqueCode: Number(deposit.unique_code),
      totalAmount: Number(deposit.total_amount),
      method: deposit.method,
      bankCode: deposit.bank_code,
      targetAccount,
      createdAt: new Date(deposit.created_at),
    });
    userEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    userEmail.to = [{ 
      email: user.email, 
      name: user.name 
    }];

    await Promise.all([
      apiInstance.sendTransacEmail(sendSmtpEmail),
      apiInstance.sendTransacEmail(userEmail),
    ]);

    console.log(`Deposit ${depositId} proof uploaded for user ${user.id}`);
    console.log(`   Emails sent to: ${user.email} (user), ${ADMIN_EMAIL} (admin)`);

    return NextResponse.json({
      success: true,
      message: "Bukti transfer berhasil diupload. Tunggu konfirmasi admin.",
    });

  } catch (error) {
    console.error("Deposit proof upload error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
