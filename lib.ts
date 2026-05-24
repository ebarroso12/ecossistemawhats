import 'server-only';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export type EventStatus = 'received' | 'queued' | 'sent' | 'failed';

export type EcosystemEvent = {
  id: string;
  external_id: string | null;
  source: string;
  kind: string;
  title: string;
  contact_name: string;
  contact_phone: string | null;
  summary: string;
  status: EventStatus;
  priority: 'critical' | 'high' | 'normal' | 'low';
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type EcosystemTask = {
  id: string;
  title: string;
  area: string;
  status: 'open' | 'doing' | 'done';
  priority: 'critical' | 'high' | 'normal' | 'low';
  due_at: string | null;
  created_at: string;
};

export type EcosystemContact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  source: string;
  last_seen_at: string;
};

export type DashboardData = {
  events: EcosystemEvent[];
  tasks: EcosystemTask[];
  contacts: EcosystemContact[];
  degraded: boolean;
  source: 'supabase' | 'sample-data';
  kpis: {
    messagesSent: number;
    failures: number;
    openTasks: number;
    contacts: number;
    webhooksToday: number;
    automationHealth: number;
  };
};

const now = new Date();

export const sampleDashboardData: DashboardData = {
  degraded: true,
  source: 'sample-data',
  kpis: {
    messagesSent: 128,
    failures: 2,
    openTasks: 9,
    contacts: 312,
    webhooksToday: 47,
    automationHealth: 96,
  },
  contacts: [
    { id: 'c1', name: 'Edson Barroso', phone: '+5516992943215', email: 'edson@clinica', source: 'openclaw', last_seen_at: now.toISOString() },
    { id: 'c2', name: 'Secretaria IA', phone: null, email: 'ai@ecosistema', source: 'fireflies', last_seen_at: new Date(now.getTime() - 3600000).toISOString() },
    { id: 'c3', name: 'Paciente prioritario', phone: '+5516000000000', email: null, source: 'webflow', last_seen_at: new Date(now.getTime() - 7200000).toISOString() },
  ],
  tasks: [
    { id: 't1', title: 'Revisar falhas de WhatsApp fora da janela de 24h', area: 'whatsapp', status: 'open', priority: 'high', due_at: null, created_at: now.toISOString() },
    { id: 't2', title: 'Conferir lead novo vindo do Webflow', area: 'crm', status: 'doing', priority: 'normal', due_at: null, created_at: now.toISOString() },
    { id: 't3', title: 'Transformar reuniao Fireflies em tarefas', area: 'fireflies', status: 'open', priority: 'normal', due_at: null, created_at: now.toISOString() },
  ],
  events: [
    {
      id: 'e1',
      external_id: 'sample-e1',
      source: 'injetaveis',
      kind: 'secretario-operacional',
      title: 'Resumo operacional recebido',
      contact_name: 'Secretario Operacional',
      contact_phone: '+5516992943215',
      summary: 'Estoque, financeiro, pacientes e protocolos sincronizados com OpenClaw.',
      status: 'sent',
      priority: 'normal',
      payload: {},
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    },
    {
      id: 'e2',
      external_id: 'sample-e2',
      source: 'webflow',
      kind: 'form_submission',
      title: 'Novo formulario Webflow',
      contact_name: 'Lead do site',
      contact_phone: '+5516000000000',
      summary: 'Form submission recebido, assinatura validada e contato criado.',
      status: 'queued',
      priority: 'high',
      payload: {},
      created_at: new Date(now.getTime() - 900000).toISOString(),
      updated_at: new Date(now.getTime() - 900000).toISOString(),
    },
    {
      id: 'e3',
      external_id: 'sample-e3',
      source: 'fireflies',
      kind: 'meeting_summary',
      title: 'Resumo de reuniao convertido',
      contact_name: 'Equipe Dr. Edson',
      contact_phone: null,
      summary: 'Decisoes e tarefas extraidas da reuniao para o segundo cerebro.',
      status: 'received',
      priority: 'normal',
      payload: {},
      created_at: new Date(now.getTime() - 1800000).toISOString(),
      updated_at: new Date(now.getTime() - 1800000).toISOString(),
    },
  ],
};

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes('SEU_PROJECT_REF')) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return sampleDashboardData;

  const [eventsResult, tasksResult, contactsResult] = await Promise.all([
    supabase.from('ecosystem_events').select('*').order('created_at', { ascending: false }).limit(80),
    supabase.from('ecosystem_tasks').select('*').order('created_at', { ascending: false }).limit(40),
    supabase.from('ecosystem_contacts').select('*').order('last_seen_at', { ascending: false }).limit(40),
  ]);

  if (eventsResult.error || tasksResult.error || contactsResult.error) {
    return {
      ...sampleDashboardData,
      degraded: true,
      source: 'sample-data',
    };
  }

  const events = (eventsResult.data ?? []) as EcosystemEvent[];
  const tasks = (tasksResult.data ?? []) as EcosystemTask[];
  const contacts = (contactsResult.data ?? []) as EcosystemContact[];
  const today = new Date().toISOString().slice(0, 10);

  return {
    events,
    tasks,
    contacts,
    degraded: false,
    source: 'supabase',
    kpis: {
      messagesSent: events.filter((event) => event.status === 'sent').length,
      failures: events.filter((event) => event.status === 'failed').length,
      openTasks: tasks.filter((task) => task.status !== 'done').length,
      contacts: contacts.length,
      webhooksToday: events.filter((event) => event.created_at.startsWith(today)).length,
      automationHealth: events.length === 0 ? 100 : Math.round((events.filter((event) => event.status !== 'failed').length / events.length) * 100),
    },
  };
}

export function verifyBearer(request: Request): boolean {
  const expected = process.env.SUPABASE_WEBHOOK_SECRET || process.env.OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_SECRET;
  if (!expected) return false;
  const value = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  return safeEqual(value, expected);
}

export function verifyWebflowSignature(rawBody: string, timestamp: string | null, signature: string | null): boolean {
  const secret = process.env.WEBFLOW_WEBHOOK_SECRET;
  if (!secret || !signature || !timestamp) return false;

  const sentAt = Number(timestamp) * 1000;
  if (!Number.isFinite(sentAt)) return false;

  const ageMs = Math.abs(Date.now() - sentAt);
  if (ageMs > 5 * 60 * 1000) return false;

  const candidates = [
    crypto.createHmac('sha256', secret).update(`${timestamp}${rawBody}`).digest('hex'),
    crypto.createHmac('sha256', secret).update(`${timestamp}:${rawBody}`).digest('hex'),
  ];

  return candidates.some((expected) => safeEqual(signature, expected));
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function normalizeEvent(source: string, payload: Record<string, unknown>) {
  const externalId = text(payload.eventId) || text(payload.id) || text(payload.webhookId) || null;
  const title = text(payload.title) || text(payload.kind) || `Evento ${source}`;
  const summary = text(payload.summary) || text(payload.aiSummary) || text(payload.message) || 'Evento recebido pelo ecossistema.';
  const contactName = text(payload.contactName) || text(payload.patientName) || text(payload.name) || 'Contato nao informado';
  const contactPhone = text(payload.contactPhone) || text(payload.patientPhone) || text(payload.phone) || null;

  return {
    external_id: externalId,
    source,
    kind: text(payload.kind) || 'webhook',
    title,
    contact_name: contactName,
    contact_phone: contactPhone,
    summary,
    status: 'received' as EventStatus,
    priority: priority(payload.priority),
    payload,
  };
}

export function eventKeyFromRawBody(rawBody: string): string {
  return crypto.createHash('sha256').update(rawBody || '{}').digest('hex');
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function priority(value: unknown): 'critical' | 'high' | 'normal' | 'low' {
  return value === 'critical' || value === 'high' || value === 'low' ? value : 'normal';
}
