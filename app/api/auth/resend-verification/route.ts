import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { generateVerificationToken } from '@/lib/auth/tokens';
import * as Brevo from '@getbrevo/brevo';
import { generateVerificationEmailHTML } from '@/lib/auth/email-templates';
import { getPrimaryDomain } from '@/lib/order-token';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email harus diisi' },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email tidak ditemukan' },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email sudah diverifikasi' },
        { status: 400 }
      );
    }

    const newVerificationToken = generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db
      .update(users)
      .set({
        verificationToken: newVerificationToken,
        verificationTokenExpiresAt: tokenExpiresAt,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const baseUrl = getPrimaryDomain();
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const verificationLink = `${protocol}://${baseUrl}/verify-email?token=${newVerificationToken}`;

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Verifikasi Email Anda - Saldopedia';
      sendSmtpEmail.htmlContent = generateVerificationEmailHTML({
        name: user.name,
        email: user.email,
        verificationLink,
      });
      sendSmtpEmail.sender = { 
        name: 'Saldopedia', 
        email: 'service.transaksi@saldopedia.com' 
      };
      sendSmtpEmail.to = [{ 
        email: user.email, 
        name: user.name 
      }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Verification email resent to ${user.email}`);
    } catch (emailError) {
      console.error('Error resending verification email:', emailError);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Gagal mengirim email verifikasi. Silakan coba lagi atau hubungi support.' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email verifikasi telah dikirim ulang. Silakan cek inbox Anda.',
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
