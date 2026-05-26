import { NextResponse } from 'next/server';
import { testIntegration } from '@/lib';

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const integration = await testIntegration(id);
    return NextResponse.json({ ok: true, integration });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao testar integracao.' }, { status: 500 });
  }
}
