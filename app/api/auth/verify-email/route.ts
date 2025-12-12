import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import * as Brevo from '@getbrevo/brevo';
import { generateWelcomeEmailHTML } from '@/lib/auth/email-templates';
import { createSession, getSessionCookieOptions } from '@/lib/auth/session';
import { getDatabaseUrl } from "@/lib/db-url";

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    // Check if token is missing or empty
    if (!token || token.trim() === '') {
      console.log('Verify email called without token');
      return NextResponse.json(
        { success: false, error: 'Token verifikasi tidak ditemukan' },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Token verifikasi tidak valid' },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { success: false, error: 'Email sudah diverifikasi sebelumnya' },
        { status: 400 }
      );
    }

    if (user.verificationTokenExpiresAt && new Date() > user.verificationTokenExpiresAt) {
      return NextResponse.json(
        { success: false, error: 'Token verifikasi sudah kadaluarsa. Silakan minta token baru.' },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));

    const { token: sessionToken, expiresAt } = await createSession(user.id);

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Selamat Datang di Saldopedia!';
      sendSmtpEmail.htmlContent = generateWelcomeEmailHTML({
        name: user.name,
        email: user.email,
      });
      sendSmtpEmail.sender = { 
        name: 'Saldopedia', 
        email: 'noreply@saldopedia.com' 
      };
      sendSmtpEmail.to = [{ 
        email: user.email, 
        name: user.name 
      }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Email berhasil diverifikasi! Anda akan diarahkan ke dashboard.',
      autoLogin: true,
    });

    response.cookies.set('saldopedia_session', sessionToken, getSessionCookieOptions(expiresAt));

    return response;

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
