import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { orders } from "@/shared/schema";
import { lt, eq, and, or, ne, isNull } from "drizzle-orm";
import * as Brevo from "@getbrevo/brevo";
import { generateExpiredEmailHTML } from "../email-templates";
import { revalidateTag } from 'next/cache';

// Initialize Brevo API
const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    // Check if CRON_SECRET is configured
    if (!process.env.CRON_SECRET) {
      console.error('CRON_SECRET environment variable is not configured');
      return NextResponse.json(
        { success: false, error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    // Authenticate cron request - support both x-cron-secret header and Authorization Bearer
    const authHeader = request.headers.get('authorization');
    const cronSecretHeader = request.headers.get('x-cron-secret');
    const providedSecret = cronSecretHeader || authHeader?.replace('Bearer ', '');

    if (!providedSecret || providedSecret !== process.env.CRON_SECRET) {
      // Log failed authentication attempt
      console.warn('Failed authentication attempt on /api/orders/check-expired', {
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
      
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    // Find all SELL orders with pending/pending_proof status that have expired (expiresAt < now)
    // BUY orders should never expire - user already paid with saldo
    // SELL orders with proof uploaded should not expire
    const expiredOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          or(
            eq(orders.status, 'pending'),
            eq(orders.status, 'pending_proof')
          ),
          lt(orders.expiresAt, new Date()),
          eq(orders.transactionType, 'sell'),
          isNull(orders.proofUploadedAt)
        )
      )
      .orderBy(orders.expiresAt);

    if (expiredOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No expired orders found",
        count: 0,
      });
    }

    const results = {
      total: expiredOrders.length,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Process each expired order
    for (const order of expiredOrders) {
      try {
        // Update order status to expired using Drizzle ORM
        await db
          .update(orders)
          .set({
            status: 'expired',
            updatedAt: new Date()
          })
          .where(eq(orders.orderId, order.orderId));

        revalidateTag(`order-${order.orderId}`, 'max');
        revalidateTag(`orders-${order.userId}`, 'max');
        if (order.customerEmail) {
          revalidateTag(`orders-email-${order.customerEmail}`, 'max');
        }

        // Send expired notification email to customer
        await sendExpiredEmail(order);
        
        results.success++;
        console.log(`Order ${order.orderId} marked as expired and email sent`);
      } catch (error) {
        results.failed++;
        const errorMsg = `Failed to process order ${order.orderId}: ${error}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} expired orders`,
      results,
    });
  } catch (error) {
    console.error("Check expired orders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check expired orders" },
      { status: 500 }
    );
  }
}

// Send expired notification email to customer
async function sendExpiredEmail(order: any) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  const serviceLabel = 
    order.serviceType === "cryptocurrency" ? "Cryptocurrency" :
    order.serviceType === "paypal" ? "PayPal" :
    "Skrill";

  const transactionLabel = order.transactionType === "buy" ? "Beli" : "Jual";

  sendSmtpEmail.subject = `Order Expired #${order.orderId} - ${serviceLabel}`;
  sendSmtpEmail.htmlContent = generateExpiredEmailHTML({
    orderId: order.orderId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    serviceType: order.serviceType,
    cryptoSymbol: order.cryptoSymbol,
    cryptoNetwork: order.cryptoNetwork,
    transactionType: order.transactionType,
    amountInput: order.amountInput,
    amountIdr: order.amountIdr,
    rate: order.rate,
    expiresAt: order.expiresAt,
  }, serviceLabel, transactionLabel);
  
  sendSmtpEmail.sender = { 
    name: "Saldopedia", 
    email: "service.transaksi@saldopedia.com" 
  };
  sendSmtpEmail.to = [{ 
    email: order.customerEmail, 
    name: order.customerName 
  }];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}
