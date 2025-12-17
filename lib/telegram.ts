const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
  };
  text?: string;
  reply_to_message?: {
    message_id: number;
    text?: string;
  };
}

export async function sendTelegramMessage(text: string, replyToMessageId?: number): Promise<number | null> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram not configured');
    return null;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        reply_to_message_id: replyToMessageId,
      }),
    });

    const data = await response.json();
    if (data.ok) {
      return data.result.message_id;
    }
    console.error('Telegram send failed:', data);
    return null;
  } catch (error) {
    console.error('Telegram error:', error);
    return null;
  }
}

export async function setTelegramWebhook(webhookUrl: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('Telegram bot token not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
      }),
    });

    const data = await response.json();
    return data.ok;
  } catch (error) {
    console.error('Telegram webhook setup error:', error);
    return false;
  }
}

export function formatNewChatMessage(sessionId: string, visitorName: string | null, message: string): string {
  return `🆕 <b>Chat Baru</b>
━━━━━━━━━━━━━━━
<b>Session:</b> <code>${sessionId}</code>
<b>Visitor:</b> ${visitorName || 'Anonymous'}

<b>Pesan:</b>
${message}

<i>Reply pesan ini untuk membalas</i>`;
}

export function formatFollowUpMessage(sessionId: string, visitorName: string | null, message: string): string {
  return `💬 <b>Pesan Masuk</b>
<b>Session:</b> <code>${sessionId}</code>
<b>Visitor:</b> ${visitorName || 'Anonymous'}

${message}`;
}

export function formatAdminRequestMessage(sessionId: string, visitorName: string | null): string {
  return `👤 <b>Request Admin</b>
━━━━━━━━━━━━━━━
<b>Session:</b> <code>${sessionId}</code>
<b>Visitor:</b> ${visitorName || 'Anonymous'}

<i>User meminta chat dengan admin. Reply untuk memulai.</i>`;
}
