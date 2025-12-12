import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users, orders, referrals, pointTransactions } from '@/shared/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { hashPassword, validatePassword } from '@/lib/auth/password';
import { generateVerificationToken } from '@/lib/auth/tokens';
import { verifyRecaptchaToken } from '@/lib/recaptcha';
import * as Brevo from '@getbrevo/brevo';
import { generateVerificationEmailHTML } from '@/lib/auth/email-templates';
import { getPrimaryDomain } from '@/lib/order-token';
import { getDatabaseUrl } from "@/lib/db-url";
import { generateUniqueUserId } from '@/lib/user-id';
import { generateReferralCode } from '@/lib/referral';
import { checkDuplicatePhone, validatePhoneNumber, normalizePhoneNumber } from '@/lib/security/transaction-security';

const REFERRER_BONUS_POINTS = 17000;
const REFERRED_BONUS_POINTS = 27000;

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone, referralCode, captchaToken } = body;

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

    if (phone) {
      const phoneValidation = validatePhoneNumber(phone);
      if (!phoneValidation.valid) {
        return NextResponse.json(
          { success: false, error: phoneValidation.error },
          { status: 400 }
        );
      }

      const phoneExists = await checkDuplicatePhone(phone);
      if (phoneExists) {
        return NextResponse.json(
          { success: false, error: 'Nomor telepon sudah terdaftar' },
          { status: 400 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = generateVerificationToken();
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const userId = await generateUniqueUserId();

    let referrerId: number | null = null;
    if (referralCode) {
      const [referrer] = await sql`
        SELECT id FROM users 
        WHERE UPPER(referral_code) = ${referralCode.toUpperCase()} 
        AND email_verified = true
      `;
      if (referrer) {
        referrerId = referrer.id;
      }
    }

    const newReferralCode = generateReferralCode(name, userId);
    const initialPoints = referrerId ? REFERRED_BONUS_POINTS : 0;

    const normalizedPhone = phone ? normalizePhoneNumber(phone) : null;

    const [newUser] = await sql`
      INSERT INTO users (id, email, password, name, phone, verification_token, verification_token_expires_at, referral_code, referred_by, points, created_at, updated_at)
      VALUES (${userId}, ${email.toLowerCase()}, ${hashedPassword}, ${name}, ${normalizedPhone}, ${verificationToken}, ${tokenExpiresAt.toISOString()}, ${newReferralCode}, ${referrerId}, ${initialPoints}, NOW(), NOW())
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
    }

    // Process referral bonus
    if (referrerId) {
      try {
        const [referralRecord] = await sql`
          INSERT INTO referrals (referrer_id, referred_id, referrer_points_awarded, referred_points_awarded, created_at)
          VALUES (${referrerId}, ${newUser.id}, ${REFERRER_BONUS_POINTS}, ${REFERRED_BONUS_POINTS}, NOW())
          RETURNING id
        `;

        await sql`
          UPDATE users SET points = points + ${REFERRER_BONUS_POINTS} WHERE id = ${referrerId}
        `;

        await sql`
          INSERT INTO point_transactions (user_id, type, amount, description, referral_id, created_at)
          VALUES 
            (${referrerId}, 'referral_bonus', ${REFERRER_BONUS_POINTS}, ${'Bonus referral: ' + name}, ${referralRecord.id}, NOW()),
            (${newUser.id}, 'referred_bonus', ${REFERRED_BONUS_POINTS}, 'Bonus pendaftaran via referral', ${referralRecord.id}, NOW())
        `;

        console.log(`Referral bonus awarded: ${referrerId} -> ${newUser.id}`);
      } catch (referralError) {
        console.error('Error processing referral bonus:', referralError);
      }
    }

    const baseUrl = getPrimaryDomain();
    const protocol = baseUrl.includes('localhost') ? 'http' : 'https';
    const verificationLink = `${protocol}://${baseUrl}/verify-email?token=${verificationToken}`;

    try {
      if (!process.env.BREVO_API_KEY) {
        console.error('BREVO_API_KEY is not configured');
        throw new Error('Email service not configured');
      }

      const emailApiInstance = new Brevo.TransactionalEmailsApi();
      emailApiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

      const sendSmtpEmail = new Brevo.SendSmtpEmail();
      sendSmtpEmail.subject = 'Verifikasi Email Anda - Saldopedia';
      sendSmtpEmail.htmlContent = generateVerificationEmailHTML({
        name,
        email: email.toLowerCase(),
        verificationLink,
      });
      sendSmtpEmail.sender = { 
        name: 'Saldopedia', 
        email: 'noreply@saldopedia.com' 
      };
      sendSmtpEmail.to = [{ 
        email: email.toLowerCase(), 
        name 
      }];

      console.log(`Attempting to send verification email to ${email}...`);
      const emailResponse = await emailApiInstance.sendTransacEmail(sendSmtpEmail);
      console.log(`Verification email sent to ${email}, messageId: ${emailResponse.body?.messageId || 'unknown'}`);
    } catch (emailError: any) {
      console.error('Error sending verification email:', emailError?.message || emailError);
      console.error('Email error details:', JSON.stringify(emailError?.response?.body || emailError, null, 2));
      
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
