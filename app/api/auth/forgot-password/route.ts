import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, passwordResetTokens } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { generateRandomToken } from '@/lib/auth/tokens';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import * as Brevo from '@getbrevo/brevo';
import { generatePasswordResetEmailHTML } from '@/lib/auth/email-templates';
import { getPrimaryDomain } from '@/lib/order-token';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, captchaToken } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email harus diisi' },
        { status: 400 }
      );
    }

    if (!captchaToken) {
      return NextResponse.json(
        { success: false, error: 'CAPTCHA verification required' },
        { status: 400 }
      );
    }

    const captchaResult = await verifyRecaptchaToken(captchaToken);
    if (!captchaResult.success) {
      return NextResponse.json(
        { success: false, error: captchaResult.error || 'CAPTCHA verification failed' },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda.',
      });
    }

    const token = generateRandomToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
    });

    const baseUrl = getPrimaryDomain();
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const resetLink = `${protocol}://${baseUrl}/reset-password?token=${token}`;

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Reset Password - Saldopedia';
      sendSmtpEmail.htmlContent = generatePasswordResetEmailHTML({
        name: user.name,
        email: user.email,
        resetLink,
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
      console.log(`Password reset email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending password reset email:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Jika email terdaftar, link reset password akan dikirim ke email Anda.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
