import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { orders, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import * as Brevo from "@getbrevo/brevo";
import { validateCompletionToken } from "@/lib/order-token";
import { generateInvoiceEmailHTML } from "../../email-templates";
import { revalidateTag } from 'next/cache';
import { getDatabaseUrl } from "@/lib/db-url";
import { getSessionUser } from "@/lib/auth/session";

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { orderId } = await params;
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token || !validateCompletionToken(orderId, token)) {
      return NextResponse.redirect(new URL('/order/complete/error?reason=invalid_token', request.url));
    }

    const adminUser = await getSessionUser();
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.redirect(new URL('/login?redirect=/admin/transactions&error=admin_required', request.url));
    }

    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.orderId, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.redirect(new URL('/order/complete/error?reason=not_found', request.url));
    }

    if (order.status === 'completed') {
      return NextResponse.redirect(new URL(`/order/complete/success?orderId=${orderId}&already_completed=true`, request.url));
    }

    if (order.status === 'expired') {
      return NextResponse.redirect(new URL('/order/complete/error?reason=expired', request.url));
    }

    if (order.status === 'cancelled') {
      return NextResponse.redirect(new URL('/order/complete/error?reason=cancelled', request.url));
    }

    const hasProofUploaded = order.proofUploadedAt !== null;
    const isConfirmedOrProcessing = ['confirmed', 'processing'].includes(order.status);
    
    if (order.expiresAt && new Date(order.expiresAt) < new Date() && !hasProofUploaded && !isConfirmedOrProcessing) {
      const sql = neon(getDatabaseUrl());
      await sql`
        UPDATE orders SET status = 'expired', updated_at = NOW()
        WHERE order_id = ${orderId} AND status = 'pending'
      `;
      
      revalidateTag(`order-${orderId}`, 'max');
      revalidateTag(`orders-${order.userId}`, 'max');
      if (order.customerEmail) {
        revalidateTag(`orders-email-${order.customerEmail}`, 'max');
      }
      
      return NextResponse.redirect(new URL('/order/complete/error?reason=expired', request.url));
    }

    const sql = neon(getDatabaseUrl());
    const completedAt = new Date();
    
    await sql`BEGIN`;
    
    try {
      const updateOrder = await sql`
        UPDATE orders 
        SET status = 'completed', updated_at = ${completedAt.toISOString()}
        WHERE order_id = ${orderId} AND status IN ('pending', 'confirmed', 'processing')
        RETURNING order_id, transaction_type, user_id, amount_idr, customer_email
      `;

      if (updateOrder.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.redirect(new URL(`/order/complete/success?orderId=${orderId}&already_completed=true`, request.url));
      }

      const confirmedOrder = updateOrder[0];
      
      if (confirmedOrder.transaction_type === 'sell' && confirmedOrder.user_id) {
        const creditAmount = Number(confirmedOrder.amount_idr);
        
        await sql`
          UPDATE users 
          SET saldo = saldo + ${creditAmount}, updated_at = ${completedAt.toISOString()}
          WHERE id = ${confirmedOrder.user_id}
        `;
        
        console.log(`Credited Rp ${creditAmount.toLocaleString('id-ID')} to user ${confirmedOrder.user_id} for SELL order ${orderId}`);
      }

      await sql`COMMIT`;

      revalidateTag(`order-${orderId}`, 'max');
      revalidateTag(`orders-${confirmedOrder.user_id}`, 'max');
      if (confirmedOrder.customer_email) {
        revalidateTag(`orders-email-${confirmedOrder.customer_email}`, 'max');
      }

    } catch (txError) {
      await sql`ROLLBACK`;
      throw txError;
    }

    try {
      await sendInvoiceEmail(order);
      console.log(`Invoice email sent to ${order.customerEmail} for order ${orderId}`);
    } catch (emailError) {
      console.error("Error sending invoice email:", emailError);
    }

    return NextResponse.redirect(new URL(`/order/complete/success?orderId=${orderId}`, request.url));
    
  } catch (error) {
    console.error("Order completion error:", error);
    return NextResponse.redirect(new URL('/order/complete/error?reason=server_error', request.url));
  }
}

async function sendInvoiceEmail(order: typeof orders.$inferSelect) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  const serviceLabel = 
    order.serviceType === "cryptocurrency" ? "Cryptocurrency" :
    order.serviceType === "paypal" ? "PayPal" :
    "Skrill";

  const transactionLabel = order.transactionType === "buy" ? "Beli" : "Jual";

  sendSmtpEmail.subject = `Invoice #${order.orderId} - Transaksi Selesai`;
  sendSmtpEmail.htmlContent = generateInvoiceEmailHTML({
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
    paymentMethod: order.paymentMethod,
    paymentAccountName: order.paymentAccountName,
    paymentAccountNumber: order.paymentAccountNumber,
    walletAddress: order.walletAddress,
    xrpTag: order.xrpTag,
    paypalEmail: order.paypalEmail,
    skrillEmail: order.skrillEmail,
    notes: order.notes,
    completedAt: new Date().toISOString(),
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
