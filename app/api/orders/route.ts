import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as Brevo from "@getbrevo/brevo";
import { generateCustomerEmailHTML, generateAdminEmailHTML } from "./email-templates";
import { getRejectUrl } from "@/lib/order-token";
import { getCompletionUrl, getPrimaryDomain } from "@/lib/order-token";
import { nowpaymentsClient } from "@/lib/nowpayments";
import { getNOWPaymentsCurrency } from "@/lib/nowpayments-mapping";
import { getMinimumAmount } from "@/lib/nowpayments-limits";
import { SYMBOL_TO_ID } from "@/lib/rates";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import { revalidateTag } from "next/cache";

const USD_TO_IDR = 16000;

async function getCryptoPriceUSD(symbol: string): Promise<number | null> {
  try {
    const coinId = SYMBOL_TO_ID[symbol];
    if (!coinId) return null;
    
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`, {
      headers: { 'User-Agent': 'SaldopediaBot/1.0' },
      next: { revalidate: 180 }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data[coinId]?.usd || null;
  } catch (error) {
    console.error("Error fetching crypto price:", error);
    return null;
  }
}

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Anda harus login untuk melakukan transaksi" },
        { status: 401 }
      );
    }

    if (!data.customerName || !data.customerEmail || !data.customerPhone) {
      return NextResponse.json(
        { success: false, error: "Data customer tidak lengkap" },
        { status: 400 }
      );
    }

    if (!data.serviceType || !data.transactionType || !data.amountInput) {
      return NextResponse.json(
        { success: false, error: "Data transaksi tidak lengkap" },
        { status: 400 }
      );
    }

    const sql = neon(getDatabaseUrl());

    const recentOrders = await sql`
      SELECT order_id FROM orders 
      WHERE user_id = ${user.id} 
        AND service_type = ${data.serviceType}
        AND transaction_type = ${data.transactionType}
        AND amount_input = ${data.amountInput}
        AND status IN ('pending', 'pending_proof', 'confirmed', 'processing')
        AND created_at > NOW() - INTERVAL '2 minutes'
      LIMIT 1
    `;

    if (recentOrders.length > 0) {
      return NextResponse.json(
        { success: false, error: "Order serupa sudah dibuat dalam 2 menit terakhir. Silakan cek halaman order Anda." },
        { status: 429 }
      );
    }

    const paidWithSaldo = data.transactionType === "buy";
    
    if (paidWithSaldo) {
      const userSaldo = parseFloat(user.saldo?.toString() || "0");
      const amountIdr = parseFloat(data.amountIdr);
      
      if (isNaN(amountIdr) || amountIdr <= 0) {
        return NextResponse.json(
          { success: false, error: "Jumlah transaksi tidak valid" },
          { status: 400 }
        );
      }
      
      if (userSaldo < amountIdr) {
        return NextResponse.json(
          { success: false, error: `Saldo tidak cukup. Saldo Anda: Rp ${userSaldo.toLocaleString('id-ID')}, Total: Rp ${amountIdr.toLocaleString('id-ID')}` },
          { status: 400 }
        );
      }
    }

    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 7);
    const orderId = `ORD-${timestamp}-${random}`.toUpperCase();

    const cryptoSymbol = data.serviceType === "cryptocurrency" ? (data.cryptoSymbol || null) : null;
    const cryptoNetwork = data.serviceType === "cryptocurrency" ? (data.cryptoNetwork || null) : null;

    if (data.serviceType === "cryptocurrency" && cryptoSymbol) {
      const cryptoAmount = parseFloat(data.amountInput);
      const cryptoPriceUSD = await getCryptoPriceUSD(cryptoSymbol);
      
      if (!cryptoPriceUSD || cryptoPriceUSD <= 0) {
        return NextResponse.json(
          { success: false, error: "Gagal memvalidasi harga crypto. Silakan coba lagi." },
          { status: 503 }
        );
      }

      const cryptoPriceIDR = cryptoPriceUSD * USD_TO_IDR;
      
      let minimumResult = null;
      try {
        minimumResult = await getMinimumAmount(cryptoSymbol, cryptoPriceUSD, USD_TO_IDR);
      } catch (minCheckError) {
        console.error("Error fetching NOWPayments minimum:", minCheckError);
      }
      
      if (minimumResult && cryptoAmount < minimumResult.minAmount) {
        const transactionLabel = data.transactionType === "buy" ? "pembelian" : "penjualan";
        return NextResponse.json(
          { 
            success: false, 
            error: `Minimum ${transactionLabel} ${cryptoSymbol}: ${minimumResult.minAmount.toFixed(8)} ${cryptoSymbol} (Rp ${minimumResult.minAmountIDR.toLocaleString('id-ID')})` 
          },
          { status: 400 }
        );
      }
      
      if (data.transactionType === "buy") {
        const amountIDR = parseFloat(data.amountIdr);
        const staticMin = 25000;
        const dynamicMin = minimumResult?.minAmountIDR || 0;
        const effectiveMin = Math.max(staticMin, dynamicMin);
        
        if (amountIDR < effectiveMin) {
          return NextResponse.json(
            { success: false, error: `Minimum pembelian ${cryptoSymbol}: Rp ${effectiveMin.toLocaleString('id-ID')}` },
            { status: 400 }
          );
        }
      } else if (data.transactionType === "sell") {
        const staticMinIDR = 50000;
        const dynamicMinIDR = minimumResult?.minAmountIDR || 0;
        const effectiveMinIDR = Math.max(staticMinIDR, dynamicMinIDR);
        const totalIDR = cryptoAmount * cryptoPriceIDR;
        
        if (totalIDR < effectiveMinIDR) {
          const minCrypto = effectiveMinIDR / cryptoPriceIDR;
          return NextResponse.json(
            { success: false, error: `Minimum jual ${cryptoSymbol}: ${minCrypto.toFixed(8)} ${cryptoSymbol} (Rp ${effectiveMinIDR.toLocaleString('id-ID')})` },
            { status: 400 }
          );
        }
      }
    }

    let nowpaymentsPaymentId = null;
    let depositAddress = null;
    let paymentStatus = null;

    if (data.serviceType === "cryptocurrency" && data.transactionType === "sell") {
      try {
        const nowpaymentsCurrency = getNOWPaymentsCurrency(data.cryptoSymbol, data.cryptoNetwork);
        
        if (!nowpaymentsCurrency) {
          return NextResponse.json(
            { success: false, error: `Network ${data.cryptoNetwork} tidak didukung untuk ${data.cryptoSymbol}` },
            { status: 400 }
          );
        }

        const domain = getPrimaryDomain();
        const ipnCallbackUrl = `https://${domain}/api/nowpayments/ipn`;

        const payment = await nowpaymentsClient.createPayment({
          price_amount: parseFloat(data.amountIdr),
          price_currency: 'idr',
          pay_currency: nowpaymentsCurrency,
          pay_amount: parseFloat(data.amountInput),
          order_id: orderId,
          order_description: `Jual ${data.cryptoSymbol} via ${data.cryptoNetwork}`,
          ipn_callback_url: ipnCallbackUrl,
        });

        nowpaymentsPaymentId = payment.payment_id;
        depositAddress = payment.pay_address;
        paymentStatus = payment.payment_status;

        console.log(`NOWPayments custody wallet created for order ${orderId}`);
        console.log(`   Payment ID: ${nowpaymentsPaymentId}`);
        console.log(`   Deposit Address: ${depositAddress}`);
        console.log(`   Currency: ${nowpaymentsCurrency}`);
      } catch (nowpaymentsError) {
        console.error("NOWPayments error:", nowpaymentsError);
        return NextResponse.json(
          { success: false, error: "Gagal membuat wallet deposit. Silakan coba lagi." },
          { status: 500 }
        );
      }
    }

    const isSellPayPalSkrill = !paidWithSaldo && data.transactionType === 'sell' && (data.serviceType === 'paypal' || data.serviceType === 'skrill');
    const initialStatus = paidWithSaldo ? 'confirmed' : (isSellPayPalSkrill ? 'pending_proof' : 'pending');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const createdAt = new Date();
    
    await sql`BEGIN`;
    
    try {
      if (paidWithSaldo) {
        const amountIdr = parseFloat(data.amountIdr);
        
        const updateResult = await sql`
          UPDATE users 
          SET saldo = saldo - ${amountIdr}, updated_at = ${createdAt.toISOString()}
          WHERE id = ${user.id} AND saldo >= ${amountIdr}
          RETURNING saldo
        `;
        
        if (updateResult.length === 0) {
          await sql`ROLLBACK`;
          return NextResponse.json(
            { success: false, error: "Saldo tidak cukup atau terjadi kesalahan" },
            { status: 400 }
          );
        }
        
        const newSaldo = parseFloat(updateResult[0].saldo?.toString() || "0");
        const networkFee = parseFloat(data.networkFee) || 0;
        console.log(`Saldo deducted for order ${orderId}:`);
        console.log(`   User ${user.id}: deducted ${amountIdr} (crypto: ${amountIdr - networkFee}, network fee: ${networkFee}), new saldo: ${newSaldo}`);
      }
      
      // Get network fee from request (0 for non-crypto or sell orders)
      const networkFee = parseFloat(data.networkFee) || 0;
      
      await sql`
        INSERT INTO orders (
          order_id,
          user_id,
          customer_name,
          customer_email,
          customer_phone,
          service_type,
          crypto_symbol,
          crypto_network,
          transaction_type,
          amount_input,
          amount_idr,
          rate,
          network_fee,
          payment_method,
          payment_account_name,
          payment_account_number,
          wallet_address,
          xrp_tag,
          paypal_email,
          skrill_email,
          notes,
          status,
          paid_with_saldo,
          nowpayments_payment_id,
          deposit_address,
          payment_status,
          expires_at,
          created_at,
          updated_at
        ) VALUES (
          ${orderId},
          ${user.id},
          ${data.customerName},
          ${data.customerEmail},
          ${data.customerPhone},
          ${data.serviceType},
          ${cryptoSymbol},
          ${cryptoNetwork},
          ${data.transactionType},
          ${data.amountInput},
          ${data.amountIdr},
          ${data.rate},
          ${networkFee},
          ${paidWithSaldo ? 'saldo' : (data.paymentMethod || null)},
          ${data.paymentAccountName || null},
          ${data.paymentAccountNumber || null},
          ${data.walletAddress || null},
          ${data.xrpTag || null},
          ${data.paypalEmail || null},
          ${data.skrillEmail || null},
          ${data.notes || null},
          ${initialStatus},
          ${paidWithSaldo},
          ${nowpaymentsPaymentId},
          ${depositAddress},
          ${paymentStatus},
          ${expiresAt.toISOString()},
          ${createdAt.toISOString()},
          ${createdAt.toISOString()}
        )
      `;

      await sql`COMMIT`;

    } catch (txError) {
      await sql`ROLLBACK`;
      console.error("Order transaction error:", txError);
      return NextResponse.json(
        { success: false, error: "Terjadi kesalahan saat membuat order" },
        { status: 500 }
      );
    }

    let nowpaymentsPayoutId = null;
    let payoutStatus = null;

    if (data.serviceType === "cryptocurrency" && data.transactionType === "buy" && paidWithSaldo) {
      const nowpaymentsCurrency = getNOWPaymentsCurrency(data.cryptoSymbol, data.cryptoNetwork);
      
      if (!nowpaymentsCurrency) {
        console.error(`BUY order ${orderId}: Network mapping not found for ${data.cryptoSymbol} on ${data.cryptoNetwork}`);
        const amountIdr = parseFloat(data.amountIdr);
        await sql`UPDATE users SET saldo = saldo + ${amountIdr} WHERE id = ${user.id}`;
        await sql`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = ${orderId}`;
        console.log(`Refunded ${amountIdr} to user ${user.id} due to mapping error`);
        return NextResponse.json(
          { success: false, error: `Network ${data.cryptoNetwork} tidak didukung untuk ${data.cryptoSymbol}. Saldo telah dikembalikan.` },
          { status: 400 }
        );
      }
      
      if (!data.walletAddress) {
        console.error(`BUY order ${orderId}: No wallet address provided`);
        const amountIdr = parseFloat(data.amountIdr);
        await sql`UPDATE users SET saldo = saldo + ${amountIdr} WHERE id = ${user.id}`;
        await sql`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = ${orderId}`;
        console.log(`Refunded ${amountIdr} to user ${user.id} due to missing wallet`);
        return NextResponse.json(
          { success: false, error: "Alamat wallet tidak boleh kosong. Saldo telah dikembalikan." },
          { status: 400 }
        );
      }
      
      if (!nowpaymentsClient.hasPayoutCredentials()) {
        console.error(`BUY order ${orderId}: NOWPayments payout credentials not configured`);
        const amountIdr = parseFloat(data.amountIdr);
        await sql`UPDATE users SET saldo = saldo + ${amountIdr} WHERE id = ${user.id}`;
        await sql`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = ${orderId}`;
        console.log(`Refunded ${amountIdr} to user ${user.id} due to missing payout credentials`);
        return NextResponse.json(
          { success: false, error: "Sistem payout sedang tidak tersedia. Silakan coba lagi nanti atau hubungi admin." },
          { status: 503 }
        );
      }
      
      try {
        const domain = getPrimaryDomain();
        const ipnCallbackUrl = `https://${domain}/api/nowpayments/payout-ipn`;
        
        // Calculate crypto amount including network fee buffer
        // User paid: crypto_price_IDR + network_fee_IDR
        // We need to send: crypto_amount + network_fee_crypto
        // So that after NOWPayments deducts their fee, user receives crypto_amount
        const baseCryptoAmount = parseFloat(data.amountInput);
        const networkFeeIDR = parseFloat(data.networkFee) || 0;
        const rate = parseFloat(data.rate) || 0;
        
        // Convert network fee IDR to crypto amount (this covers NOWPayments withdrawal fee)
        const networkFeeCrypto = rate > 0 ? networkFeeIDR / rate : 0;
        const totalCryptoToSend = baseCryptoAmount + networkFeeCrypto;
        
        console.log(`Creating payout for order ${orderId}:`);
        console.log(`   Currency: ${nowpaymentsCurrency}`);
        console.log(`   Base crypto amount: ${baseCryptoAmount}`);
        console.log(`   Network fee (IDR): ${networkFeeIDR} → Crypto: ${networkFeeCrypto.toFixed(8)}`);
        console.log(`   Total to send: ${totalCryptoToSend.toFixed(8)}`);
        console.log(`   Address: ${data.walletAddress}`);

        const payout = await nowpaymentsClient.createSinglePayout(
          data.walletAddress,
          nowpaymentsCurrency,
          totalCryptoToSend,
          ipnCallbackUrl,
          data.xrpTag || undefined,
          orderId
        );

        const withdrawalId = payout.withdrawals?.[0]?.id || payout.id;
        nowpaymentsPayoutId = withdrawalId.toString();
        payoutStatus = payout.withdrawals?.[0]?.status || payout.status;

        await sql`
          UPDATE orders 
          SET 
            nowpayments_payout_id = ${nowpaymentsPayoutId},
            payout_status = ${payoutStatus},
            updated_at = NOW()
          WHERE order_id = ${orderId}
        `;

        console.log(`NOWPayments payout created for order ${orderId}`);
        console.log(`   Withdrawal ID: ${nowpaymentsPayoutId}`);
        console.log(`   Batch ID: ${payout.id}`);
        console.log(`   Status: ${payoutStatus}`);
      } catch (payoutError) {
        console.error("NOWPayments payout error:", payoutError);
        const amountIdr = parseFloat(data.amountIdr);
        await sql`UPDATE users SET saldo = saldo + ${amountIdr} WHERE id = ${user.id}`;
        await sql`UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE order_id = ${orderId}`;
        console.log(`Refunded ${amountIdr} to user ${user.id} due to payout API error`);
        return NextResponse.json(
          { success: false, error: "Gagal mengirim crypto. Saldo telah dikembalikan. Silakan coba lagi." },
          { status: 500 }
        );
      }
    }

    // Get network fee for email (recalculate from stored data)
    const emailNetworkFee = parseFloat(data.networkFee) || 0;
    
    const emailData = {
      orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      serviceType: data.serviceType,
      cryptoSymbol: data.cryptoSymbol,
      cryptoNetwork: data.cryptoNetwork,
      transactionType: data.transactionType,
      amountInput: data.amountInput,
      amountIdr: data.amountIdr,
      rate: data.rate,
      networkFee: emailNetworkFee,
      paymentMethod: paidWithSaldo ? 'saldo' : data.paymentMethod,
      paymentAccountName: data.paymentAccountName,
      paymentAccountNumber: data.paymentAccountNumber,
      walletAddress: data.walletAddress,
      xrpTag: data.xrpTag,
      paypalEmail: data.paypalEmail,
      skrillEmail: data.skrillEmail,
      notes: data.notes,
      depositAddress: depositAddress,
      nowpaymentsPaymentId: nowpaymentsPaymentId,
      paidWithSaldo: paidWithSaldo,
      completionUrl: getCompletionUrl(orderId),
      rejectUrl: getRejectUrl(orderId),
    };

    try {
      await Promise.all([
        sendCustomerEmail(emailData),
        sendAdminEmail(emailData),
      ]);
      console.log(`Emails sent for order ${orderId}:`);
      console.log(`   Customer: ${data.customerEmail}`);
      console.log(`   Admin: ${process.env.ADMIN_NOTIFICATION_EMAIL || "hopshitmeme@gmail.com"}`);
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
    }

    revalidateTag(`orders-${user.id}`, 'max');
    revalidateTag(`orders-email-${data.customerEmail}`, 'max');

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order berhasil dibuat",
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

async function sendCustomerEmail(data: any) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  const serviceLabel = 
    data.serviceType === "cryptocurrency" ? "Cryptocurrency" :
    data.serviceType === "paypal" ? "PayPal" :
    "Skrill";

  const transactionLabel = data.transactionType === "buy" ? "Beli" : "Jual";

  sendSmtpEmail.subject = `Order Konfirmasi #${data.orderId} - ${serviceLabel}`;
  sendSmtpEmail.htmlContent = generateCustomerEmailHTML(data, serviceLabel, transactionLabel);
  sendSmtpEmail.sender = { 
    name: "Saldopedia", 
    email: "service.transaksi@saldopedia.com" 
  };
  sendSmtpEmail.to = [{ 
    email: data.customerEmail, 
    name: data.customerName 
  }];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}

async function sendAdminEmail(data: any) {
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  const serviceLabel = 
    data.serviceType === "cryptocurrency" ? "Cryptocurrency" :
    data.serviceType === "paypal" ? "PayPal" :
    "Skrill";

  const transactionLabel = data.transactionType === "buy" ? "Beli" : "Jual";

  sendSmtpEmail.subject = `Order Baru #${data.orderId} - ${serviceLabel} ${transactionLabel}`;
  sendSmtpEmail.htmlContent = generateAdminEmailHTML(data, serviceLabel, transactionLabel);
  sendSmtpEmail.sender = { 
    name: "Saldopedia System", 
    email: "service.transaksi@saldopedia.com" 
  };
  sendSmtpEmail.to = [{ 
    email: process.env.ADMIN_NOTIFICATION_EMAIL || "hopshitmeme@gmail.com", 
    name: "Saldopedia Admin" 
  }];

  await apiInstance.sendTransacEmail(sendSmtpEmail);
}
