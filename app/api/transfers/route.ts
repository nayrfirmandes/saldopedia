import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from 'drizzle-orm/neon-http';
import { saldoTransfers, users } from '@/shared/schema';
import { eq, desc, or, sql as drizzleSql } from 'drizzle-orm';
import { getSessionUser } from "@/lib/auth/session";
import { getDatabaseUrl } from "@/lib/db-url";
import * as Brevo from "@getbrevo/brevo";
import { generateTransferSenderEmailHTML, generateTransferReceiverEmailHTML } from "./email-templates";

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY || "");

function generateTransferId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TF${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { recipientEmail, amount, notes } = data;

    if (!recipientEmail || !amount) {
      return NextResponse.json(
        { error: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const transferAmount = Number(amount);
    const minimumTransfer = 10000;

    if (isNaN(transferAmount) || transferAmount < minimumTransfer) {
      return NextResponse.json(
        { error: `Minimum transfer Rp ${minimumTransfer.toLocaleString('id-ID')}` },
        { status: 400 }
      );
    }

    if (recipientEmail.toLowerCase() === user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Tidak dapat transfer ke diri sendiri" },
        { status: 400 }
      );
    }

    const [recipient] = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, recipientEmail.toLowerCase()))
      .limit(1);

    if (!recipient) {
      return NextResponse.json(
        { error: "Penerima tidak ditemukan" },
        { status: 404 }
      );
    }

    const transferId = generateTransferId();
    const createdAt = new Date();

    const sql = neon(getDatabaseUrl());
    
    await sql`BEGIN`;
    
    try {
      const deductResult = await sql`
        UPDATE users 
        SET saldo = saldo - ${transferAmount}, updated_at = ${createdAt.toISOString()}
        WHERE id = ${user.id} AND saldo >= ${transferAmount}
        RETURNING saldo
      `;

      if (deductResult.length === 0) {
        await sql`ROLLBACK`;
        return NextResponse.json(
          { error: "Saldo tidak mencukupi" },
          { status: 400 }
        );
      }

      const creditResult = await sql`
        UPDATE users 
        SET saldo = saldo + ${transferAmount}, updated_at = ${createdAt.toISOString()}
        WHERE id = ${recipient.id}
        RETURNING saldo
      `;

      await sql`
        INSERT INTO saldo_transfers (transfer_id, sender_id, receiver_id, amount, notes, created_at)
        VALUES (${transferId}, ${user.id}, ${recipient.id}, ${transferAmount}, ${notes || null}, ${createdAt.toISOString()})
      `;

      await sql`COMMIT`;

      const senderNewSaldo = Number(deductResult[0]?.saldo || 0);
      const receiverNewSaldo = Number(creditResult[0]?.saldo || 0);

      try {
        const senderEmail = new Brevo.SendSmtpEmail();
        senderEmail.subject = `Transfer Saldo Berhasil #${transferId}`;
        senderEmail.htmlContent = generateTransferSenderEmailHTML({
          transferId,
          senderName: user.name,
          receiverName: recipient.name,
          receiverEmail: recipient.email,
          amount: transferAmount,
          notes: notes || null,
          newSaldo: senderNewSaldo,
          createdAt,
        });
        senderEmail.sender = { name: "Saldopedia", email: "service.transaksi@saldopedia.com" };
        senderEmail.to = [{ email: user.email, name: user.name }];

        const receiverEmailObj = new Brevo.SendSmtpEmail();
        receiverEmailObj.subject = `Anda Menerima Transfer Saldo #${transferId}`;
        receiverEmailObj.htmlContent = generateTransferReceiverEmailHTML({
          transferId,
          senderName: user.name,
          senderEmail: user.email,
          receiverName: recipient.name,
          amount: transferAmount,
          notes: notes || null,
          newSaldo: receiverNewSaldo,
          createdAt,
        });
        receiverEmailObj.sender = { name: "Saldopedia", email: "service.transaksi@saldopedia.com" };
        receiverEmailObj.to = [{ email: recipient.email, name: recipient.name }];

        await Promise.all([
          apiInstance.sendTransacEmail(senderEmail),
          apiInstance.sendTransacEmail(receiverEmailObj),
        ]);
        console.log(`Transfer emails sent for ${transferId}:`);
        console.log(`   Sender: ${user.email}`);
        console.log(`   Receiver: ${recipient.email}`);
      } catch (emailError) {
        console.error("Error sending transfer emails:", emailError);
      }

      console.log(`Transfer ${transferId} completed:`);
      console.log(`   ${user.email} -> ${recipient.email}: Rp ${transferAmount.toLocaleString('id-ID')}`);

      return NextResponse.json({
        success: true,
        transferId,
        message: `Transfer ke ${recipient.name} berhasil`,
        recipientName: recipient.name,
        newSaldo: senderNewSaldo
      });

    } catch (txError) {
      await sql`ROLLBACK`;
      throw txError;
    }

  } catch (error) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userTransfers = await db
      .select({
        id: saldoTransfers.id,
        transferId: saldoTransfers.transferId,
        senderId: saldoTransfers.senderId,
        receiverId: saldoTransfers.receiverId,
        amount: saldoTransfers.amount,
        notes: saldoTransfers.notes,
        createdAt: saldoTransfers.createdAt,
      })
      .from(saldoTransfers)
      .where(
        or(
          eq(saldoTransfers.senderId, user.id),
          eq(saldoTransfers.receiverId, user.id)
        )
      )
      .orderBy(desc(saldoTransfers.createdAt))
      .limit(50);

    const userIds = new Set<number>();
    userTransfers.forEach(t => {
      userIds.add(t.senderId);
      userIds.add(t.receiverId);
    });

    const userMap: Record<number, { name: string; email: string }> = {};
    
    if (userIds.size > 0) {
      const usersData = await db
        .select({ id: users.id, name: users.name, email: users.email })
        .from(users)
        .where(
          drizzleSql`${users.id} IN (${drizzleSql.raw(Array.from(userIds).join(','))})`
        );
      
      usersData.forEach(u => {
        userMap[u.id] = { name: u.name, email: u.email };
      });
    }

    const enrichedTransfers = userTransfers.map(t => ({
      ...t,
      type: t.senderId === user.id ? 'sent' : 'received',
      senderName: userMap[t.senderId]?.name || 'Unknown',
      senderEmail: userMap[t.senderId]?.email || '',
      receiverName: userMap[t.receiverId]?.name || 'Unknown',
      receiverEmail: userMap[t.receiverId]?.email || '',
    }));

    return NextResponse.json({ transfers: enrichedTransfers });

  } catch (error) {
    console.error("Get transfers error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
