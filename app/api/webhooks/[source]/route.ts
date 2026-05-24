import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, normalizeEvent, verifyBearer, verifyWebflowSignature } from '@/lib';

type Params = {
  params: Promise<{ source: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { source } = await params;
  const rawBody = await request.text();
  const isWebflow = source === 'webflow';

  if (isWebflow) {
    const signature = request.headers.get('x-webflow-signature');
    if (!verifyWebflowSignature(rawBody, signature) && !verifyBearer(request)) {
      return NextResponse.json({ error: 'invalid webflow signature' }, { status: 401 });
    }
  } else if (!verifyBearer(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody || '{}') as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const event = normalizeEvent(source, payload);
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: true, stored: false, event }, { status: 202 });
  }

  const { data, error } = await supabase
    .from('ecosystem_events')
    .insert(event)
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (event.contact_phone || event.contact_name) {
    await supabase.from('ecosystem_contacts').upsert({
      source,
      contact_key: event.contact_phone || `${source}:${event.contact_name}`,
      name: event.contact_name,
      phone: event.contact_phone,
      last_seen_at: new Date().toISOString(),
      metadata: { lastEventId: data.id, lastKind: event.kind },
    }, { onConflict: 'source,contact_key' });
  }

  return NextResponse.json({ ok: true, stored: true, id: data.id }, { status: 202 });
}
