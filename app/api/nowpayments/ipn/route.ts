import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { nowpaymentsClient } from "@/lib/nowpayments";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateSellCompletionEmailHTML, generateAdminSellNotificationHTML } from "../email-templates";

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "Saldopedia.co@gmail.com";

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log("NOWPayments IPN received:", JSON.stringify(body, null, 2));

    const signature = request.headers.get("x-nowpayments-sig");
    
    if (!signature) {
      console.error("NOWPayments IPN: Missing signature header");
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 401 }
      );
    }

    const isValid = nowpaymentsClient.verifyIPNSignature(body, signature);
    
    if (!isValid) {
      console.error("NOWPayments IPN: Invalid signature");
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    const {
      payment_id,
      order_id,
      payment_status,
      pay_amount,
      actually_paid,
      outcome_amount,
      outcome_currency,
    } = body;

    if (!payment_id || !order_id) {
      console.error("NOWPayments IPN: Missing required fields");
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log(`NOWPayments IPN: Payment ${payment_id} status: ${payment_status}`);
    console.log(`   Order ID: ${order_id}`);
    console.log(`   Expected: ${pay_amount}, Actually Paid: ${actually_paid}`);

    let result = await sql`
      UPDATE orders
      SET 
        payment_status = ${payment_status},
        actually_paid = ${actually_paid?.toString() || null},
        updated_at = NOW()
      WHERE order_id = ${order_id}
      RETURNING *
    `;

    if (result.length === 0) {
      console.log(`NOWPayments IPN: Order ${order_id} not found by order_id, trying payment_id...`);
      
      result = await sql`
        UPDATE orders
        SET 
          payment_status = ${payment_status},
          actually_paid = ${actually_paid?.toString() || null},
          updated_at = NOW()
        WHERE nowpayments_payment_id = ${payment_id.toString()}
        RETURNING *
      `;
      
      if (result.length === 0) {
        console.error(`NOWPayments IPN: Order not found by order_id: ${order_id} or payment_id: ${payment_id}`);
        console.error(`   This order may have been deleted, expired, or never created.`);
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 }
        );
      } else {
        console.log(`NOWPayments IPN: Order found by payment_id: ${payment_id}`);
      }
    }

    const order = result[0];

    console.log(`NOWPayments IPN: Order ${order_id} updated successfully`);
    console.log(`   New status: ${payment_status}`);
    console.log(`   Amount paid: ${actually_paid}`);

    if (payment_status === "finished" || payment_status === "confirmed") {
      console.log(`NOWPayments IPN: Payment confirmed for order ${order_id}`);
      
      if (order.transaction_type === "sell" && order.user_id && order.status !== "completed") {
        try {
          const expectedAmount = parseFloat(order.amount_input?.toString() || "0");
          const actuallyPaidAmount = parseFloat(actually_paid?.toString() || "0");
          const expectedAmountIdr = parseFloat(order.amount_idr?.toString() || "0");
          const rate = parseFloat(order.rate?.toString() || "0");
          
          let finalAmountIdr = expectedAmountIdr;
          let paymentNote = "exact";
          
          if (actuallyPaidAmount > 0 && expectedAmount > 0 && rate > 0) {
            const tolerance = 0.001;
            const difference = actuallyPaidAmount - expectedAmount;
            const percentDiff = Math.abs(difference) / expectedAmount;
            
            if (percentDiff > tolerance) {
              finalAmountIdr = actuallyPaidAmount * rate;
              
              if (difference > 0) {
                paymentNote = "overpaid";
                console.log(`NOWPayments IPN: OVERPAYMENT DETECTED`);
                console.log(`   Expected: ${expectedAmount}, Actually Paid: ${actuallyPaidAmount}`);
                console.log(`   Overpaid by: ${difference.toFixed(8)} (${(percentDiff * 100).toFixed(2)}%)`);
                console.log(`   Adjusting saldo from Rp ${expectedAmountIdr.toLocaleString('id-ID')} to Rp ${finalAmountIdr.toLocaleString('id-ID')}`);
              } else {
                paymentNote = "underpaid";
                console.log(`NOWPayments IPN: UNDERPAYMENT DETECTED`);
                console.log(`   Expected: ${expectedAmount}, Actually Paid: ${actuallyPaidAmount}`);
                console.log(`   Underpaid by: ${Math.abs(difference).toFixed(8)} (${(percentDiff * 100).toFixed(2)}%)`);
                console.log(`   Adjusting saldo from Rp ${expectedAmountIdr.toLocaleString('id-ID')} to Rp ${finalAmountIdr.toLocaleString('id-ID')}`);
              }
            }
          }
          
          if (finalAmountIdr > 0) {
            // Use transaction to ensure atomic order update + saldo credit
            await sql`BEGIN`;
            
            try {
              const creditResult = await sql`
                UPDATE orders 
                SET status = 'completed', 
                    amount_idr = ${finalAmountIdr.toFixed(2)},
                    payment_note = ${paymentNote},
                    updated_at = NOW()
                WHERE order_id = ${order_id} AND status != 'completed'
                RETURNING id
              `;
              
              if (creditResult.length > 0) {
                const updateResult = await sql`
                  UPDATE users 
                  SET saldo = saldo + ${finalAmountIdr}, updated_at = NOW()
                  WHERE id = ${order.user_id}
                  RETURNING id, email, saldo
                `;
                
                await sql`COMMIT`;
                
                if (updateResult.length > 0) {
                  const user = updateResult[0];
                  console.log(`NOWPayments IPN: AUTO CREDIT SALDO SUCCESS`);
                  console.log(`   User ID: ${user.id}`);
                  console.log(`   Email: ${user.email}`);
                  console.log(`   Payment note: ${paymentNote}`);
                  console.log(`   Amount credited: Rp ${finalAmountIdr.toLocaleString('id-ID')}`);
                  console.log(`   New saldo: Rp ${parseFloat(user.saldo?.toString() || "0").toLocaleString('id-ID')}`);
                  
                  await sendSellCompletionEmail(order, user, finalAmountIdr, paymentNote, expectedAmount, actuallyPaidAmount);
                  await sendAdminSellNotification(order, user, finalAmountIdr, paymentNote, expectedAmount, actuallyPaidAmount);
                }
              } else {
                await sql`ROLLBACK`;
                console.log(`NOWPayments IPN: Order ${order_id} already completed, skipping duplicate credit`);
              }
            } catch (txError) {
              await sql`ROLLBACK`;
              console.error(`NOWPayments IPN: Transaction failed, rolled back:`, txError);
              throw txError;
            }
          }
        } catch (creditError) {
          console.error(`NOWPayments IPN: Failed to auto-credit saldo:`, creditError);
        }
      } else if (order.status === "completed") {
        console.log(`NOWPayments IPN: Order ${order_id} already completed, ignoring duplicate IPN`);
      }
    } else if (payment_status === "partially_paid") {
      console.log(`NOWPayments IPN: Partial payment received for order ${order_id}`);
      console.log(`   Expected: ${pay_amount}, Actually Paid: ${actually_paid}`);
      console.log(`   Waiting for remaining payment or handling as underpayment...`);
      
    } else if (payment_status === "failed" || payment_status === "expired") {
      console.log(`NOWPayments IPN: Payment ${payment_status} for order ${order_id}`);
      
      const partiallyPaidAmount = parseFloat(actually_paid?.toString() || "0");
      
      if (payment_status === "expired" && partiallyPaidAmount > 0 && order.transaction_type === "sell" && order.user_id && order.status !== "completed") {
        console.log(`NOWPayments IPN: Expired order with partial payment detected`);
        console.log(`   Actually paid: ${partiallyPaidAmount}`);
        
        try {
          const expectedAmount = parseFloat(order.amount_input?.toString() || "0");
          const rate = parseFloat(order.rate?.toString() || "0");
          
          if (rate > 0) {
            const partialAmountIdr = partiallyPaidAmount * rate;
            
            // Use transaction to ensure atomic order update + saldo credit
            await sql`BEGIN`;
            
            try {
              const creditResult = await sql`
                UPDATE orders 
                SET status = 'completed', 
                    amount_idr = ${partialAmountIdr.toFixed(2)},
                    payment_note = 'partial_expired',
                    updated_at = NOW()
                WHERE order_id = ${order_id} AND status != 'completed'
                RETURNING id
              `;
              
              if (creditResult.length > 0) {
                const updateResult = await sql`
                  UPDATE users 
                  SET saldo = saldo + ${partialAmountIdr}, updated_at = NOW()
                  WHERE id = ${order.user_id}
                  RETURNING id, email, saldo
                `;
                
                await sql`COMMIT`;
                
                if (updateResult.length > 0) {
                  const user = updateResult[0];
                  console.log(`NOWPayments IPN: PARTIAL EXPIRED CREDIT SUCCESS`);
                  console.log(`   User ID: ${user.id}`);
                  console.log(`   Email: ${user.email}`);
                  console.log(`   Partial amount credited: Rp ${partialAmountIdr.toLocaleString('id-ID')}`);
                  console.log(`   New saldo: Rp ${parseFloat(user.saldo?.toString() || "0").toLocaleString('id-ID')}`);
                  
                  await sendSellCompletionEmail(order, user, partialAmountIdr, "underpaid", expectedAmount, partiallyPaidAmount);
                  await sendAdminSellNotification(order, user, partialAmountIdr, "underpaid", expectedAmount, partiallyPaidAmount);
                }
              } else {
                await sql`ROLLBACK`;
                console.log(`NOWPayments IPN: Order ${order_id} already completed, skipping partial credit`);
              }
            } catch (txError) {
              await sql`ROLLBACK`;
              console.error(`NOWPayments IPN: Partial credit transaction failed, rolled back:`, txError);
              throw txError;
            }
          }
        } catch (partialError) {
          console.error(`NOWPayments IPN: Failed to credit partial payment:`, partialError);
        }
      } else {
        await sql`
          UPDATE orders 
          SET status = ${payment_status}, updated_at = NOW()
          WHERE order_id = ${order_id}
        `;
      }
    } else {
      console.log(`NOWPayments IPN: Payment in progress (${payment_status}) for order ${order_id}`);
    }

    return NextResponse.json({ success: true, order_id: order_id });
  } catch (error) {
    console.error("NOWPayments IPN error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function sendSellCompletionEmail(order: any, user: any, amountIdr: number, paymentNote: string = "exact", expectedAmount: number = 0, actuallyPaid: number = 0) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    
    const cryptoAmount = actuallyPaid > 0 ? actuallyPaid : parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    
    sendSmtpEmail.subject = `Order Selesai - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateSellCompletionEmailHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      cryptoSymbol,
      cryptoAmount,
      amountIdr,
      paymentNote: paymentNote as 'exact' | 'overpaid' | 'underpaid',
      expectedAmount,
      actuallyPaid
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
    console.log(`NOWPayments IPN: Completion email sent to ${order.customer_email}`);
  } catch (emailError) {
    console.error("NOWPayments IPN: Failed to send completion email:", emailError);
  }
}

async function sendAdminSellNotification(order: any, user: any, amountIdr: number, paymentNote: string = "exact", expectedAmount: number = 0, actuallyPaidParam: number = 0) {
  try {
    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    const adminEmail = ADMIN_EMAIL;
    
    const cryptoAmount = expectedAmount > 0 ? expectedAmount : parseFloat(order.amount_input?.toString() || "0");
    const cryptoSymbol = order.crypto_symbol || "CRYPTO";
    const actuallyPaid = actuallyPaidParam > 0 ? actuallyPaidParam : parseFloat(order.actually_paid?.toString() || "0");
    const newSaldo = parseFloat(user.saldo?.toString() || "0");
    
    const paymentNoteLabel = paymentNote === "overpaid" ? " [OVERPAID]" : paymentNote === "underpaid" ? " [UNDERPAID]" : "";
    
    sendSmtpEmail.subject = `[ADMIN] JUAL Crypto Sukses${paymentNoteLabel} - ${order.order_id}`;
    sendSmtpEmail.htmlContent = generateAdminSellNotificationHTML({
      orderId: order.order_id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      userId: user.id,
      cryptoSymbol,
      expectedAmount: cryptoAmount,
      actuallyPaid,
      amountIdr,
      newSaldo,
      paymentNote: paymentNote as 'exact' | 'overpaid' | 'underpaid',
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
    console.log(`NOWPayments IPN: Admin notification sent to ${adminEmail}`);
  } catch (emailError) {
    console.error("NOWPayments IPN: Failed to send admin notification:", emailError);
  }
}
