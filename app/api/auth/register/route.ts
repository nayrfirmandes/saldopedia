import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, orders } from '@/shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { generateVerificationToken } from '@/lib/auth/tokens';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import * as Brevo from '@getbrevo/brevo';
import { generateVerificationEmailHTML } from '@/lib/auth/email-templates';
import { getPrimaryDomain } from '@/lib/order-token';
import { getDatabaseUrl } from "@/lib/db-url";
import { generateUniqueUserId } from '@/lib/user-id';

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, captchaToken } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, dan nama harus diisi' },
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.error },
        { status: 400 }
      );
    }

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const userId = await generateUniqueUserId();

    const [newUser] = await sql`
      INSERT INTO users (id, email, password, name, phone, verification_token, verification_token_expires_at, created_at, updated_at)
      VALUES (${userId}, ${email.toLowerCase()}, ${hashedPassword}, ${name}, ${phone || null}, ${verificationToken}, ${tokenExpiresAt.toISOString()}, NOW(), NOW())
      RETURNING id, email, name
    `;

    // Auto-link guest orders to newly registered user
    try {
      await db
        .update(orders)
        .set({ userId: newUser.id })
        .where(
          and(
            eq(orders.customerEmail, email.toLowerCase()),
            isNull(orders.userId)
          )
        );
      console.log(`Linked guest orders to new user ${newUser.id} (${email})`);
    } catch (linkError) {
      console.error('Error linking guest orders:', linkError);
      // Continue registration even if linking fails
    }

    const baseUrl = getPrimaryDomain();
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const verificationLink = `${protocol}://${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Verifikasi Email Anda - Saldopedia';
      sendSmtpEmail.htmlContent = generateVerificationEmailHTML({
        name,
        email: email.toLowerCase(),
        verificationLink,
      });
      sendSmtpEmail.sender = { 
        name: 'Saldopedia', 
        email: 'service.transaksi@saldopedia.com' 
      };
      sendSmtpEmail.to = [{ 
        email: email.toLowerCase(), 
        name 
      }];

      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      
      await db.delete(users).where(eq(users.id, newUser.id));
      
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
      message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
