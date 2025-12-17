import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { chatSessions, chatMessages, chatKnowledge } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';
import { sendTelegramMessage } from '@/lib/telegram';
import { extractKeywords } from '@/lib/chat-knowledge';
import type { TelegramMessage } from '@/lib/telegram';

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

async function handleLearnCommand(text: string, fromId: number): Promise<string> {
  const normalizedText = text.replace(/\n/g, ' ');
  const learnMatch = normalizedText.match(/^\/learn\s+(.+?)\s*\|\s*(.+)$/);
  
  if (!learnMatch) {
    return 'Format salah. Gunakan:\n/learn pertanyaan | jawaban\n\nContoh:\n/learn Apa itu USDT? | USDT adalah stablecoin yang nilainya dipatok 1:1 dengan USD.';
  }
  
  const question = learnMatch[1].trim();
  const answer = learnMatch[2].trim();
  
  if (question.length < 5 || answer.length < 10) {
    return 'Pertanyaan atau jawaban terlalu pendek. Minimal 5 karakter untuk pertanyaan dan 10 karakter untuk jawaban.';
  }
  
  const keywords = extractKeywords(question + ' ' + answer).join(',');
  
  await db.insert(chatKnowledge).values({
    question,
    answer,
    keywords,
    addedBy: `telegram_${fromId}`,
  });
  
  return `Bot berhasil belajar!\n\nQ: ${question}\nA: ${answer}\n\nKeywords: ${keywords}`;
}

async function handleListCommand(): Promise<string> {
  const knowledge = await db.select()
    .from(chatKnowledge)
    .orderBy(chatKnowledge.usageCount)
    .limit(10);
  
  if (knowledge.length === 0) {
    return 'Belum ada pengetahuan yang dipelajari.\n\nGunakan /learn pertanyaan | jawaban untuk mengajarkan bot.';
  }
  
  const list = knowledge.map((k, i) => 
    `${i + 1}. [${k.usageCount}x] ${k.question.substring(0, 50)}${k.question.length > 50 ? '...' : ''}`
  ).join('\n');
  
  return `Daftar pengetahuan bot (10 teratas):\n\n${list}\n\nTotal: ${knowledge.length} item`;
}

async function handleDeleteCommand(text: string): Promise<string> {
  const deleteMatch = text.match(/^\/delete\s+(\d+)$/);
  
  if (!deleteMatch) {
    return 'Format salah. Gunakan:\n/delete [id]\n\nContoh:\n/delete 5';
  }
  
  const id = parseInt(deleteMatch[1], 10);
  
  const existing = await db.select()
    .from(chatKnowledge)
    .where(eq(chatKnowledge.id, id))
    .limit(1);
  
  if (existing.length === 0) {
    return `Pengetahuan dengan ID ${id} tidak ditemukan.`;
  }
  
  await db.delete(chatKnowledge).where(eq(chatKnowledge.id, id));
  
  return `Berhasil menghapus:\nQ: ${existing[0].question}`;
}

async function handleHelpCommand(): Promise<string> {
  return `Perintah Bot Saldopedia:

/learn pertanyaan | jawaban
  Mengajarkan bot pengetahuan baru
  
/list
  Melihat daftar pengetahuan yang dipelajari
  
/delete [id]
  Menghapus pengetahuan berdasarkan ID
  
/help
  Menampilkan bantuan ini

Untuk membalas chat user, cukup reply pesan notifikasi.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const message = body.message as TelegramMessage | undefined;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const fromId = message.chat.id;

    if (text.startsWith('/learn ')) {
      const response = await handleLearnCommand(text, fromId);
      await sendTelegramMessage(response);
      return NextResponse.json({ ok: true });
    }

    if (text === '/list') {
      const response = await handleListCommand();
      await sendTelegramMessage(response);
      return NextResponse.json({ ok: true });
    }

    if (text.startsWith('/delete ')) {
      const response = await handleDeleteCommand(text);
      await sendTelegramMessage(response);
      return NextResponse.json({ ok: true });
    }

    if (text === '/help' || text === '/start') {
      const response = await handleHelpCommand();
      await sendTelegramMessage(response);
      return NextResponse.json({ ok: true });
    }

    if (!message.reply_to_message) {
      return NextResponse.json({ ok: true });
    }

    const replyText = message.reply_to_message.text || '';
    const sessionMatch = replyText.match(/Session:\s*([a-z0-9_]+)/i);
    
    let sessionId: string | null = null;
    if (sessionMatch) {
      sessionId = sessionMatch[1];
    }

    if (!sessionId) {
      const sessions = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.telegramMessageId, message.reply_to_message.message_id))
        .limit(1);

      if (sessions.length > 0) {
        sessionId = sessions[0].sessionId;
      }
    }

    if (!sessionId) {
      console.log('Could not find session for telegram reply');
      return NextResponse.json({ ok: true });
    }

    await db.insert(chatMessages).values({
      sessionId,
      sender: 'admin',
      message: message.text,
      telegramMessageId: message.message_id,
    });

    await db.update(chatSessions)
      .set({ 
        lastMessageAt: new Date(),
        telegramMessageId: message.message_id,
      })
      .where(eq(chatSessions.sessionId, sessionId));

    console.log(`Admin reply saved for session ${sessionId}`);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Telegram webhook active' });
}
