import { NextRequest, NextResponse } from 'next/server';
import { eventKeyFromRawBody, getSupabaseAdmin, normalizeEvent, verifyBearer, verifyWebflowSignature } from '@/lib';

type Params = {
  params: Promise<{ source: string }>;
};

export async function POST(request: NextRequest, { params }: Params) {
  const { source } = await params;
  const rawBody = await request.text();
  const isWebflow = source === 'webflow';

  if (isWebflow) {
    const signature = request.headers.get('x-webflow-signature');
    const timestamp = request.headers.get('x-webflow-timestamp');
    if (!verifyWebflowSignature(rawBody, timestamp, signature)) {
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
  event.external_id = event.external_id || eventKeyFromRawBody(rawBody);
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ ok: true, stored: false, event }, { status: 202 });
  }

  const { data, error } = await supabase
    .from('ecosystem_events')
    .upsert(event, { onConflict: 'source,external_id' })
    .select('id')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (event.contact_phone || event.contact_name) {
    const { error: contactError } = await supabase.from('ecosystem_contacts').upsert({
      source,
      contact_key: event.contact_phone || `${source}:${event.contact_name}`,
      name: event.contact_name,
      phone: event.contact_phone,
      last_seen_at: new Date().toISOString(),
      metadata: { lastEventId: data.id, lastKind: event.kind },
    }, { onConflict: 'source,contact_key' });

    if (contactError) {
      return NextResponse.json({ ok: true, stored: true, id: data.id, warning: contactError.message }, { status: 207 });
    }
  }

  return NextResponse.json({ ok: true, stored: true, id: data.id }, { status: 202 });
}
