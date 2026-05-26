import { NextResponse } from 'next/server';
import { createIntegration, listIntegrations } from '@/lib';

export async function GET() {
  try {
    const data = await listIntegrations();
    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao carregar integracoes.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { name?: string; provider?: string; category?: string };
    const name = String(body.name || '').trim();
    const provider = String(body.provider || '').trim();
    const category = String(body.category || 'automation').trim();

    if (name.length < 3 || provider.length < 2) {
      return NextResponse.json({ ok: false, error: 'Informe nome e provedor da integracao.' }, { status: 400 });
    }

    const integration = await createIntegration({ name, provider, category });
    return NextResponse.json({ ok: true, integration });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao criar integracao.' }, { status: 500 });
  }
}
