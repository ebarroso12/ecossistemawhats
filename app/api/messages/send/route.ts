import { NextRequest, NextResponse } from 'next/server';
import { verifyBearer } from '@/lib';

export async function POST(request: NextRequest) {
  if (!verifyBearer(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { to?: string; message?: string } | null;
  const message = body?.message?.trim();
  const to = body?.to?.trim() || process.env.WHATSAPP_DEFAULT_TO;

  if (!message || !to) {
    return NextResponse.json({ error: 'to and message are required' }, { status: 400 });
  }

  const hubUrl = process.env.OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_URL;
  const hubSecret = process.env.OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_SECRET;

  if (!hubUrl || !hubSecret) {
    return NextResponse.json({ ok: false, configured: false }, { status: 202 });
  }

  const response = await fetch(hubUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${hubSecret}`,
    },
    body: JSON.stringify({
      kind: 'manual-message',
      title: 'Mensagem manual do Ecossistema Whats',
      contactName: 'Contato WhatsApp',
      contactPhone: to,
      summary: message,
      send: true,
    }),
  });

  return NextResponse.json({ ok: response.ok, status: response.status }, { status: response.ok ? 202 : 502 });
}
