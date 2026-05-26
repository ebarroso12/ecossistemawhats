import { NextResponse } from 'next/server';
import { updateIntegration } from '@/lib';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json().catch(() => ({})) as {
      enabled?: boolean;
      name?: string;
      provider?: string;
      category?: string;
      status_detail?: string;
    };

    const integration = await updateIntegration(id, {
      enabled: typeof body.enabled === 'boolean' ? body.enabled : undefined,
      name: body.name ? String(body.name).trim() : undefined,
      provider: body.provider ? String(body.provider).trim() : undefined,
      category: body.category ? String(body.category).trim() : undefined,
      status_detail: body.status_detail ? String(body.status_detail).trim() : undefined,
    });

    return NextResponse.json({ ok: true, integration });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : 'Erro ao atualizar integracao.' }, { status: 500 });
  }
}
