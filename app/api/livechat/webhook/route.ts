import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { chatSessions, chatMessages } from '@/shared/schema';
import { eq } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';
import type { TelegramMessage } from '@/lib/telegram';

const sql = neon(getDatabaseUrl());
const db = drizzle(sql);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const message = body.message as TelegramMessage | undefined;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    if (!message.reply_to_message) {
      return NextResponse.json({ ok: true });
    }

    const replyText = message.reply_to_message.text || '';
    const sessionMatch = replyText.match(/Session:\s*<code>([^<]+)<\/code>|Session:\s*`([^`]+)`|Session:\s*(\S+)/i);
    
    let sessionId: string | null = null;
    if (sessionMatch) {
      sessionId = sessionMatch[1] || sessionMatch[2] || sessionMatch[3];
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
