import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import * as Brevo from "@getbrevo/brevo";
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import { getCompletionUrl, getRejectUrl } from "@/lib/order-token";
import { generateOrderProofAdminEmailHTML, generateOrderProofUserEmailHTML } from "../email-templates";

const sql = neon(getDatabaseUrl());

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || "hopshitmeme@gmail.com";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const proofFile = formData.get('proof') as File | null;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID tidak valid" },
        { status: 400 }
      );
    }

    if (!proofFile || proofFile.size === 0) {
      return NextResponse.json(
        { success: false, error: "Bukti pengiriman wajib diupload" },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(proofFile.type)) {
      return NextResponse.json(
        { success: false, error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, atau PDF" },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (proofFile.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Ukuran file maksimal 10MB" },
        { status: 400 }
      );
    }

    const orders = await sql`
      SELECT * FROM orders 
      WHERE order_id = ${orderId} 
      AND user_id = ${user.id}
      AND status = 'pending_proof'
      AND transaction_type = 'sell'
      AND (service_type = 'paypal' OR service_type = 'skrill')
    `;

    if (orders.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order tidak ditemukan atau sudah diproses" },
        { status: 404 }
      );
    }

    const order = orders[0];

    if (order.expires_at && new Date(order.expires_at) < new Date()) {
      await sql`
        UPDATE orders SET status = 'expired', updated_at = NOW() WHERE order_id = ${orderId}
      `;
      return NextResponse.json(
        { success: false, error: "Order sudah kadaluarsa" },
        { status: 400 }
      );
    }

    const updateResult = await sql`
      UPDATE orders SET status = 'pending', expires_at = NULL, proof_uploaded_at = NOW(), updated_at = NOW()
      WHERE order_id = ${orderId} AND status = 'pending_proof'
      RETURNING order_id
    `;
    
    if (updateResult.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order sudah diproses atau kadaluarsa" },
        { status: 400 }
      );
    }

    const confirmUrl = getCompletionUrl(orderId);
    const rejectUrl = getRejectUrl(orderId);

    const fileBuffer = await proofFile.arrayBuffer();
    const base64Content = Buffer.from(fileBuffer).toString('base64');

    const fileExtension = proofFile.name.split('.').pop() || 'jpg';
    const serviceLabel = order.service_type === 'paypal' ? 'paypal' : 'skrill';
    const attachmentName = `bukti_${serviceLabel}_${orderId}.${fileExtension}`;

    const sendSmtpEmail = new Brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `Jual ${serviceLabel.toUpperCase()} - Bukti Diterima #${orderId}`;
    sendSmtpEmail.htmlContent = generateOrderProofAdminEmailHTML({
      orderId,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
      serviceType: order.service_type,
      amountInput: order.amount_input,
      amountIdr: order.amount_idr,
      rate: order.rate,
      paypalEmail: order.paypal_email,
      skrillEmail: order.skrill_email,
      confirmUrl,
      rejectUrl,
      createdAt: new Date(order.created_at),
    });
    sendSmtpEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    sendSmtpEmail.to = [{ 
      email: ADMIN_EMAIL, 
      name: "Saldopedia Admin" 
    }];
    sendSmtpEmail.attachment = [{
      content: base64Content,
      name: attachmentName,
    }];

    const userEmail = new Brevo.SendSmtpEmail();
    userEmail.subject = `Bukti Pengiriman ${serviceLabel.toUpperCase()} Diterima #${orderId}`;
    userEmail.htmlContent = generateOrderProofUserEmailHTML({
      orderId,
      userName: user.name,
      serviceType: order.service_type,
      amountInput: order.amount_input,
      amountIdr: order.amount_idr,
      createdAt: new Date(order.created_at),
    });
    userEmail.sender = { 
      name: "Saldopedia", 
      email: "service.transaksi@saldopedia.com" 
    };
    userEmail.to = [{ 
      email: user.email, 
      name: user.name 
    }];

    await Promise.all([
      apiInstance.sendTransacEmail(sendSmtpEmail),
      apiInstance.sendTransacEmail(userEmail),
    ]);

    console.log(`Order ${orderId} proof uploaded for user ${user.id}`);
    console.log(`   Emails sent to: ${user.email} (user), ${ADMIN_EMAIL} (admin)`);

    return NextResponse.json({
      success: true,
      message: "Bukti pengiriman berhasil diupload. Tunggu konfirmasi admin.",
    });

  } catch (error) {
    console.error("Order proof upload error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
