import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { chatSessions, chatMessages, chatKnowledge } from '@/shared/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { getDatabaseUrl } from '@/lib/db-url';
import OpenAI from 'openai';
import { SYSTEM_PROMPT, extractKeywords, calculateRelevanceScore } from '@/lib/chat-knowledge';
import { sendTelegramMessage, formatNewChatMessage, formatFollowUpMessage, formatAdminRequestMessage } from '@/lib/telegram';

const sqlClient = neon(getDatabaseUrl());
const db = drizzle(sqlClient);

function getOpenAIClient() {
  return new OpenAI({
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  });
}

function generateSessionId(): string {
  return 'chat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

async function getLearnedKnowledge(userMessage: string): Promise<string> {
  try {
    const allKnowledge = await db.select().from(chatKnowledge);
    
    if (allKnowledge.length === 0) return '';
    
    const questionKeywords = extractKeywords(userMessage);
    
    const relevantKnowledge = allKnowledge
      .map(k => {
        const keywords = k.keywords ? k.keywords.split(',').map(kw => kw.trim()) : extractKeywords(k.question);
        const score = calculateRelevanceScore(userMessage, keywords);
        return { ...k, score };
      })
      .filter(k => k.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    if (relevantKnowledge.length === 0) return '';
    
    for (const k of relevantKnowledge) {
      await db.update(chatKnowledge)
        .set({ usageCount: sql`${chatKnowledge.usageCount} + 1` })
        .where(eq(chatKnowledge.id, k.id));
    }
    
    const knowledgeText = relevantKnowledge
      .map(k => `Q: ${k.question}\nA: ${k.answer}`)
      .join('\n\n');
    
    return `\n\nPENGETAHUAN TAMBAHAN YANG DIPELAJARI:\n${knowledgeText}`;
  } catch (error) {
    console.error('Error fetching learned knowledge:', error);
    return '';
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, message, visitorName } = body;

    if (action === 'start') {
      const newSessionId = generateSessionId();
      
      await db.insert(chatSessions).values({
        sessionId: newSessionId,
        visitorName: visitorName || null,
        status: 'active',
      });

      await db.insert(chatMessages).values({
        sessionId: newSessionId,
        sender: 'ai',
        message: 'Halo! Saya asisten virtual Saldopedia. Ada yang bisa saya bantu hari ini?',
      });

      return NextResponse.json({
        success: true,
        sessionId: newSessionId,
        messages: [{
          sender: 'ai',
          message: 'Halo! Saya asisten virtual Saldopedia. Ada yang bisa saya bantu hari ini?',
          createdAt: new Date().toISOString(),
        }],
      });
    }

    if (action === 'send' && sessionId && message) {
      await db.insert(chatMessages).values({
        sessionId,
        sender: 'user',
        message,
      });

      await db.update(chatSessions)
        .set({ lastMessageAt: new Date() })
        .where(eq(chatSessions.sessionId, sessionId));

      const session = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.sessionId, sessionId))
        .limit(1);

      if (session.length === 0) {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
      }

      const currentSession = session[0];

      if (currentSession.status === 'waiting_admin') {
        const telegramMsgId = await sendTelegramMessage(
          formatFollowUpMessage(sessionId, currentSession.visitorName, message),
          currentSession.telegramMessageId || undefined
        );

        return NextResponse.json({
          success: true,
          reply: {
            sender: 'ai',
            message: 'Pesan Anda sudah diteruskan ke admin. Mohon tunggu balasannya ya.',
            createdAt: new Date().toISOString(),
          },
        });
      }

      const recentMessages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(10);

      const chatHistory = recentMessages.reverse().map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.message,
      }));

      const learnedKnowledge = await getLearnedKnowledge(message);
      const enhancedSystemPrompt = SYSTEM_PROMPT + learnedKnowledge;

      try {
        const completion = await getOpenAIClient().chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: enhancedSystemPrompt },
            ...chatHistory,
          ],
          max_tokens: 500,
          temperature: 0.7,
        });

        const aiReply = completion.choices[0]?.message?.content || 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';

        await db.insert(chatMessages).values({
          sessionId,
          sender: 'ai',
          message: aiReply,
        });

        return NextResponse.json({
          success: true,
          reply: {
            sender: 'ai',
            message: aiReply,
            createdAt: new Date().toISOString(),
          },
        });
      } catch (aiError) {
        console.error('AI error:', aiError);
        return NextResponse.json({
          success: true,
          reply: {
            sender: 'ai',
            message: 'Maaf, terjadi kendala teknis. Silakan coba lagi atau hubungi admin.',
            createdAt: new Date().toISOString(),
          },
        });
      }
    }

    if (action === 'request_admin' && sessionId) {
      const session = await db.select()
        .from(chatSessions)
        .where(eq(chatSessions.sessionId, sessionId))
        .limit(1);

      if (session.length === 0) {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
      }

      const recentMessages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(desc(chatMessages.createdAt))
        .limit(5);

      const chatSummary = recentMessages.reverse()
        .filter(m => m.sender === 'user')
        .map(m => m.message)
        .join('\n');

      const telegramMsgId = await sendTelegramMessage(
        formatAdminRequestMessage(sessionId, session[0].visitorName) + 
        (chatSummary ? `\n\n<b>Riwayat chat:</b>\n${chatSummary}` : '')
      );

      await db.update(chatSessions)
        .set({ 
          status: 'waiting_admin',
          telegramMessageId: telegramMsgId,
        })
        .where(eq(chatSessions.sessionId, sessionId));

      await db.insert(chatMessages).values({
        sessionId,
        sender: 'ai',
        message: 'Permintaan Anda sudah diteruskan ke admin. Mohon tunggu, admin akan segera membalas.',
      });

      return NextResponse.json({
        success: true,
        reply: {
          sender: 'ai',
          message: 'Permintaan Anda sudah diteruskan ke admin. Mohon tunggu, admin akan segera membalas.',
          createdAt: new Date().toISOString(),
        },
      });
    }

    if (action === 'get_messages' && sessionId) {
      const messages = await db.select()
        .from(chatMessages)
        .where(eq(chatMessages.sessionId, sessionId))
        .orderBy(chatMessages.createdAt);

      return NextResponse.json({
        success: true,
        messages: messages.map(m => ({
          sender: m.sender,
          message: m.message,
          createdAt: m.createdAt.toISOString(),
        })),
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Livechat error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
