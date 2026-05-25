import { NextRequest, NextResponse } from 'next/server';

type TelegramUpdate = {
  update_id?: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
};

type TelegramMessage = {
  message_id?: number;
  text?: string;
  chat?: {
    id?: number | string;
    type?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
  from?: {
    id?: number | string;
    username?: string;
    first_name?: string;
    last_name?: string;
  };
};

export async function POST(request: NextRequest) {
  const expectedSecret = process.env.OPENCLAW_TELEGRAM_WEBHOOK_SECRET;
  const sentSecret = request.headers.get('x-telegram-bot-api-secret-token');

  if (!expectedSecret || sentSecret !== expectedSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const update = await request.json().catch(() => null) as TelegramUpdate | null;
  const message = update?.message || update?.edited_message;
  const text = message?.text?.trim();
  const chatId = message?.chat?.id ? String(message.chat.id) : '';

  if (!text || !chatId) {
    return NextResponse.json({ ok: true, ignored: true }, { status: 202 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
  const commandResponse = await fetch(`${appUrl}/api/commands`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-telegram-bot-api-secret-token': expectedSecret,
    },
    body: JSON.stringify({
      channel: 'telegram',
      chatId,
      text,
      contactName: displayName(message),
      payload: {
        update_id: update?.update_id,
        message_id: message?.message_id,
        chat_type: message?.chat?.type,
        username: message?.from?.username || message?.chat?.username,
      },
    }),
  });

  const result = await commandResponse.json().catch(() => ({}));
  await sendTelegramReply(chatId, text, commandResponse.ok, result);

  return NextResponse.json({ ok: commandResponse.ok, command: result }, { status: commandResponse.ok ? 202 : 200 });
}

function displayName(message?: TelegramMessage): string {
  const from = message?.from || message?.chat;
  const name = [from?.first_name, from?.last_name].filter(Boolean).join(' ').trim();
  return name || from?.username || (message?.chat?.id ? String(message.chat.id) : 'Telegram');
}

async function sendTelegramReply(chatId: string, text: string, ok: boolean, result: Record<string, unknown>) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const command = text.split(/\s+/)[0] || text;
  const reply = ok
    ? `Recebido: ${command}\nMicrotarefa registrada no Ecossistema Whats.`
    : `Nao consegui registrar: ${command}\n${String(result.error || 'erro desconhecido')}`;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: reply }),
  }).catch(() => null);
}
