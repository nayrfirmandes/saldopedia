import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { nowpaymentsClient } from "@/lib/nowpayments";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateBuyCompletionEmailHTML, generateAdminBuyNotificationHTML } from "../email-templates";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "Saldopedia.co@gmail.com";

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("NOWPayments Payout IPN received:", JSON.stringify(body, null, 2));

    const signature = request.headers.get("x-nowpayments-sig");
    
    if (!signature) {
      console.error("NOWPayments Payout IPN: Missing signature header");
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 401 }
      );
    }

    const isValid = nowpaymentsClient.verifyIPNSignature(body, signature);
    
    if (!isValid) {
      console.error("NOWPayments Payout IPN: Invalid signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const {
      id: payoutId,
      batch_withdrawal_id,
      status,
      currency,
      amount,
      address,
      hash,
      error,
    } = body;

    if (!payoutId) {
      console.error("NOWPayments Payout IPN: Missing payout ID");
      return NextResponse.json(
        { success: false, error: "Missing payout ID" },
        { status: 400 }
      );
    }

    console.log(`NOWPayments Payout IPN: Payout ${payoutId} status: ${status}`);
    console.log(`   Currency: ${currency}, Amount: ${amount}`);
    console.log(`   Address: ${address}`);
    if (hash) console.log(`   TX Hash: ${hash}`);
    if (error) console.log(`   Error: ${error}`);

    const result = await sql`
      UPDATE orders
      SET 
        payout_status = ${status},
        payout_hash = ${hash || null},
        payout_error = ${error || null},
        updated_at = NOW()
      WHERE nowpayments_payout_id = ${payoutId.toString()}
      RETURNING *
    `;

    if (result.length === 0) {
      console.error(`NOWPayments Payout IPN: Order not found for payout_id: ${payoutId}`);
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const order = result[0];

    console.log(`NOWPayments Payout IPN: Order ${order.order_id} updated`);

    if (status === "finished" || status === "FINISHED") {
      if (order.status !== "completed") {
        const updateResult = await sql`
          UPDATE orders 
          SET status = 'completed', updated_at = NOW()
          WHERE order_id = ${order.order_id} AND status != 'completed'
          RETURNING id
        `;
        
        if (updateResult.length > 0) {
          console.log(`NOWPayments Payout IPN: Payout completed for order ${order.order_id}`);
          await sendBuyCompletionEmail(order, hash);
          await sendAdminBuyNotification(order, hash, amount, currency, address);
        } else {
          console.log(`NOWPayments Payout IPN: Order ${order.order_id} already completed, ignoring duplicate`);
        }
      } else {
        console.log(`NOWPayments Payout IPN: Order ${order.order_id} already completed, ignoring duplicate IPN`);
      }
    } else if (status === "failed" || status === "FAILED" || status === "rejected" || status === "REJECTED") {
      if (order.status !== "failed") {
        const failResult = await sql`
          UPDATE orders 
          SET status = 'failed', updated_at = NOW()
          WHERE order_id = ${order.order_id} AND status != 'failed'
          RETURNING id
        `;
        
        if (failResult.length > 0) {
          console.error(`NOWPayments Payout IPN: Payout failed for order ${order.order_id}`);
          console.error(`   Error: ${error}`);
          
          if (order.user_id && order.amount_idr) {
            const amountIdr = parseFloat(order.amount_idr.toString());
            await sql`
              UPDATE users 
              SET saldo = saldo + ${amountIdr}, updated_at = NOW()
              WHERE id = ${order.user_id}
            `;
            console.log(`NOWPayments Payout IPN: Refunded ${amountIdr} to user ${order.user_id}`);
          }
        } else {
          console.log(`NOWPayments Payout IPN: Order ${order.order_id} already failed, ignoring duplicate refund`);
        }
      } else {
        console.log(`NOWPayments Payout IPN: Order ${order.order_id} already failed, ignoring duplicate IPN`);
      }
    }

    return NextResponse.json({ success: true, payout_id: payoutId });
  } catch (error) {
    console.error("NOWPayments Payout IPN error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendBuyCompletionEmail(order: any, txHash?: string) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    const cryptoAmount = parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    const walletAddress = order.wallet_address || "";
    
    sendSmtpEmail.subject = `Order Selesai - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateBuyCompletionEmailHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      cryptoSymbol,
      cryptoAmount,
      walletAddress,
      txHash
    });
    
    sendSmtpEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: order.customer_email, 
      name: order.customer_name 
    }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`NOWPayments Payout IPN: Completion email sent to ${order.customer_email}`);
  } catch (emailError) {
    console.error("NOWPayments Payout IPN: Failed to send completion email:", emailError);
  }
}

async function sendAdminBuyNotification(order: any, txHash?: string, payoutAmount?: string, payoutCurrency?: string, payoutAddress?: string) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    const adminEmail = ADMIN_EMAIL;
    
    const cryptoAmount = parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    const amountIdr = parseFloat(order.amount_idr?.toString() || "0");
    const walletAddress = order.wallet_address || payoutAddress || "";
    
    sendSmtpEmail.subject = `[ADMIN] BELI Crypto Sukses - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateAdminBuyNotificationHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      userId: order.user_id,
      cryptoSymbol,
      cryptoAmount,
      amountIdr,
      walletAddress,
      txHash,
      payoutAmount,
      payoutCurrency,
      completedAt: new Date()
    });
    
    sendSmtpEmail.sender = { 
      name: "Saldopedia System", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: adminEmail, 
      name: "Admin Saldopedia" 
    }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`NOWPayments Payout IPN: Admin notification sent to ${adminEmail}`);
  } catch (emailError) {
    console.error("NOWPayments Payout IPN: Failed to send admin notification:", emailError);
  }
}
