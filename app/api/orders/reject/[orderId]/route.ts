import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { orders, users } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import * as Brevo from "@getbrevo/brevo";
import { validateCompletionToken } from "@/lib/order-token";
import { generateOrderRejectedEmailHTML } from "../../email-templates";
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
      return NextResponse.redirect(new URL(`/admin/result?type=order&action=reject&status=already_completed&id=${orderId}`, request.url));
    }

    if (order.status === 'cancelled') {
      return NextResponse.redirect(new URL(`/admin/result?type=order&action=reject&status=already_cancelled&id=${orderId}`, request.url));
    }

    if (order.status === 'expired') {
      return NextResponse.redirect(new URL(`/admin/result?type=order&action=reject&status=already_expired&id=${orderId}`, request.url));
    }

    const sql = neon(getDatabaseUrl());
    const rejectedAt = new Date();

    await sql`BEGIN`;

    try {
      const updateResult = await sql`
        UPDATE orders 
        SET status = 'cancelled', updated_at = ${rejectedAt.toISOString()}
        WHERE order_id = ${orderId} AND status IN ('pending', 'pending_proof', 'confirmed', 'processing')
        RETURNING order_id, user_id, transaction_type, amount_idr
      `;

      if (updateResult.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.redirect(new URL(`/admin/result?type=order&action=reject&status=already_processed&id=${orderId}`, request.url));
      }

      const rejectedOrder = updateResult[0];

      if (rejectedOrder.transaction_type === 'buy' && rejectedOrder.user_id) {
        const refundAmount = Number(rejectedOrder.amount_idr);
        
        await sql`
          UPDATE users 
          SET saldo = saldo + ${refundAmount}, updated_at = ${rejectedAt.toISOString()}
          WHERE id = ${rejectedOrder.user_id}
        `;
        
        console.log(`Refunded Rp ${refundAmount.toLocaleString('id-ID')} to user ${rejectedOrder.user_id} for rejected BUY order ${orderId}`);
      }

      await sql`COMMIT`;

      revalidateTag(`order-${orderId}`, 'max');
      revalidateTag(`orders-${order.userId}`, 'max');
      if (order.customerEmail) {
        revalidateTag(`orders-email-${order.customerEmail}`, 'max');
      }

    } catch (txError) {
      await sql`ROLLBACK`;
      throw txError;
    }

    try {
      await sendRejectionEmail(order);
      console.log(`Order rejection email sent to ${order.customerEmail} for order ${orderId}`);
    } catch (emailError) {
      console.error("Error sending order rejection email:", emailError);
    }

    console.log(`Order ${orderId} rejected by admin`);

    return NextResponse.redirect(new URL(`/admin/result?type=order&action=reject&status=success&id=${orderId}`, request.url));
    
  } catch (error) {
    console.error("Order rejection error:", error);
    return NextResponse.redirect(new URL('/order/complete/error?reason=server_error', request.url));
  }
}

async function sendRejectionEmail(order: typeof orders.$inferSelect) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  const serviceLabel = 
    order.serviceType === "cryptocurrency" ? "Cryptocurrency" :
    order.serviceType === "paypal" ? "PayPal" :
    "Skrill";

  const transactionLabel = order.transactionType === "buy" ? "Beli" : "Jual";

  sendSmtpEmail.subject = `Order #${order.orderId} Ditolak`;
  sendSmtpEmail.htmlContent = generateOrderRejectedEmailHTML({
    orderId: order.orderId,
    customerName: order.customerName,
    serviceType: order.serviceType,
    cryptoSymbol: order.cryptoSymbol,
    transactionType: order.transactionType,
    amountInput: order.amountInput,
    amountIdr: order.amountIdr,
    rate: order.rate,
    rejectedAt: new Date(),
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
