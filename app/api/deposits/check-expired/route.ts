import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { deposits, users } from "@/shared/schema";
import { lt, eq, and, or } from "drizzle-orm";
import * as Brevo from "@getbrevo/brevo";
import { revalidateTag } from 'next/cache';
import { generateDepositExpiredEmailHTML } from "../email-templates";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET environment variable is not configured');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get('authorization');
    const cronSecretHeader = request.headers.get('x-cron-secret');
    const providedSecret = cronSecretHeader || authHeader?.replace('Bearer ', '');

    if (!providedSecret || providedSecret !== process.env.CRON_SECRET) {
      console.warn('Failed authentication attempt on /api/deposits/check-expired', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const expiredDeposits = await db
      .select({
        deposit: deposits,
        user: {
          name: users.name,
          email: users.email,
        }
      })
      .from(deposits)
      .innerJoin(users, eq(deposits.userId, users.id))
      .where(
        and(
          or(
            eq(deposits.status, 'pending_proof'),
            eq(deposits.status, 'pending')
          ),
          lt(deposits.expiresAt, new Date())
        )
      )
      .orderBy(deposits.expiresAt);

    if (expiredDeposits.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired deposits found",
        count: 0,
      });
    }

    const results = {
      total: expiredDeposits.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const { deposit, user } of expiredDeposits) {
      try {
        await db
          .update(deposits)
          .set({
            status: 'expired',
          })
          .where(eq(deposits.depositId, deposit.depositId));

        revalidateTag(`deposit-${deposit.depositId}`, 'max');
        revalidateTag(`deposits-${deposit.userId}`, 'max');

        await sendExpiredEmail(deposit, user);
        
        results.success++;
        console.log(`Deposit ${deposit.depositId} marked as expired and email sent`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to process deposit ${deposit.depositId}: ${error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} expired deposits`,
      results,
    });
  } catch (error) {
    console.error("Check expired deposits error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check expired deposits" },
      { status: 500 }
    );
  }
}

async function sendExpiredEmail(deposit: any, user: { name: string; email: string }) {
  if (!process.env.BREVO_API_KEY) {
    console.error('BREVO_API_KEY is not configured, skipping email');
    return;
  }

  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    const amount = typeof deposit.amount === 'string' 
      ? parseFloat(deposit.amount) 
      : deposit.amount;
    const fee = typeof deposit.fee === 'string' 
      ? parseFloat(deposit.fee) 
      : (deposit.fee || 0);
    const uniqueCode = typeof deposit.uniqueCode === 'string' 
      ? parseInt(deposit.uniqueCode) 
      : (deposit.uniqueCode || 0);
    const totalAmount = amount + fee + uniqueCode;

    sendSmtpEmail.subject = `Deposit Expired #${deposit.depositId} - Saldopedia`;
    sendSmtpEmail.htmlContent = generateDepositExpiredEmailHTML({
      depositId: deposit.depositId,
      userName: user.name,
      amount,
      fee,
      uniqueCode,
      totalAmount,
      method: deposit.method,
      bankCode: deposit.bankCode,
      createdAt: deposit.createdAt,
      expiredAt: deposit.expiresAt
    });
    
    sendSmtpEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: user.email, 
      name: user.name 
    }];

    console.log(`Sending expired email to ${user.email} for deposit ${deposit.depositId}`);
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Expired email sent successfully to ${user.email}`);
  } catch (emailError) {
    console.error(`Failed to send expired email for deposit ${deposit.depositId}:`, emailError);
    throw emailError;
  }
}
