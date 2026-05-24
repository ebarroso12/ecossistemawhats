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

export type EcosystemMicroTask = {
  id: string;
  agent_key: string;
  channel: 'whatsapp' | 'telegram' | 'dashboard' | 'openclaw';
  title: string;
  objective: string;
  checklist: string[];
  status: 'queued' | 'doing' | 'blocked' | 'done' | 'failed';
  priority: 'critical' | 'high' | 'normal' | 'low';
  output_contract: string;
  due_at: string | null;
  created_at: string;
};

export type EcosystemAgentCommand = {
  id: string;
  channel: 'whatsapp' | 'telegram';
  command: string;
  agent_key: string;
  permission_level: 'read' | 'write' | 'approval_required' | 'admin';
  description: string;
  output_contract: string;
  enabled: boolean;
};

export type DashboardData = {
  events: EcosystemEvent[];
  tasks: EcosystemTask[];
  contacts: EcosystemContact[];
  microtasks: EcosystemMicroTask[];
  commands: EcosystemAgentCommand[];
  degraded: boolean;
  source: 'supabase' | 'sample-data';
  kpis: {
    messagesSent: number;
    failures: number;
    openTasks: number;
    contacts: number;
    webhooksToday: number;
    automationHealth: number;
    microtasksOpen: number;
    channelsActive: number;
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
    microtasksOpen: 5,
    channelsActive: 2,
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
  microtasks: [
    {
      id: 'm1',
      agent_key: 'secretario-clinica',
      channel: 'whatsapp',
      title: 'Resumo do dia para Dr. Edson',
      objective: 'Enviar agenda, protocolos pendentes, faltas de estoque e alertas financeiros ate 07:30.',
      checklist: ['Ler agenda', 'Conferir estoque critico', 'Listar protocolos pendentes', 'Enviar resumo aprovado'],
      status: 'queued',
      priority: 'critical',
      output_contract: 'Mensagem curta com blocos: Hoje, Riscos, Acoes, Precisa aprovar.',
      due_at: now.toISOString(),
      created_at: now.toISOString(),
    },
    {
      id: 'm2',
      agent_key: 'estoque-injetaveis',
      channel: 'telegram',
      title: 'Verificar rupturas e vencimentos',
      objective: 'Marcar itens abaixo do minimo e produtos vencendo nos proximos 30 dias.',
      checklist: ['Consultar inventario', 'Comparar minimo', 'Separar vencimentos', 'Criar tarefa de reposicao'],
      status: 'doing',
      priority: 'high',
      output_contract: 'Tabela: item, saldo, minimo, vencimento, acao.',
      due_at: null,
      created_at: now.toISOString(),
    },
    {
      id: 'm3',
      agent_key: 'crm-pacientes',
      channel: 'whatsapp',
      title: 'Responder lead novo',
      objective: 'Classificar lead, confirmar interesse e criar proximo passo no CRM.',
      checklist: ['Validar telefone', 'Checar consentimento', 'Enviar resposta', 'Registrar evento'],
      status: 'queued',
      priority: 'high',
      output_contract: 'Contato atualizado, mensagem enviada, tarefa criada.',
      due_at: null,
      created_at: now.toISOString(),
    },
    {
      id: 'm4',
      agent_key: 'fireflies-memoria',
      channel: 'openclaw',
      title: 'Converter reuniao em decisoes',
      objective: 'Extrair decisoes, responsabilidades e pendencias de transcricoes Fireflies.',
      checklist: ['Ler resumo', 'Extrair decisoes', 'Criar tarefas', 'Salvar memoria'],
      status: 'queued',
      priority: 'normal',
      output_contract: 'Lista de decisoes, tarefas e notas permanentes.',
      due_at: null,
      created_at: now.toISOString(),
    },
  ],
  commands: [
    { id: 'cmd1', channel: 'whatsapp', command: '/hoje', agent_key: 'secretario-clinica', permission_level: 'read', description: 'Resumo do dia com agenda, pacientes, estoque, financeiro e pendencias.', output_contract: 'Resumo executivo em ate 12 linhas.', enabled: true },
    { id: 'cmd2', channel: 'telegram', command: '/estoque', agent_key: 'estoque-injetaveis', permission_level: 'read', description: 'Itens criticos, vencimentos, reposicao e falta de lancamento.', output_contract: 'Tabela compacta com prioridade.', enabled: true },
    { id: 'cmd3', channel: 'whatsapp', command: '/delegar', agent_key: 'openclaw-router', permission_level: 'approval_required', description: 'Transforma pedido livre em microtarefas para agentes.', output_contract: 'Plano, responsavel, prazo, confirmacao.', enabled: true },
    { id: 'cmd4', channel: 'telegram', command: '/status', agent_key: 'openclaw-router', permission_level: 'read', description: 'Estado dos webhooks, filas, deploy, banco e OpenClaw.', output_contract: 'OK/risco/falha por servico.', enabled: true },
    { id: 'cmd5', channel: 'whatsapp', command: '/enviar', agent_key: 'secretario-clinica', permission_level: 'approval_required', description: 'Envia mensagem para paciente somente com aprovacao e politica de janela.', output_contract: 'Destino, texto, regra WhatsApp, comprovante.', enabled: true },
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

  const [eventsResult, tasksResult, contactsResult, microtasksResult, commandsResult] = await Promise.all([
    supabase.from('ecosystem_events').select('*').order('created_at', { ascending: false }).limit(80),
    supabase.from('ecosystem_tasks').select('*').order('created_at', { ascending: false }).limit(40),
    supabase.from('ecosystem_contacts').select('*').order('last_seen_at', { ascending: false }).limit(40),
    supabase.from('ecosystem_microtasks').select('*').order('created_at', { ascending: false }).limit(80),
    supabase.from('ecosystem_commands').select('*').eq('enabled', true).order('command', { ascending: true }).limit(80),
  ]);

  if (eventsResult.error || tasksResult.error || contactsResult.error || microtasksResult.error || commandsResult.error) {
    return {
      ...sampleDashboardData,
      degraded: true,
      source: 'sample-data',
    };
  }

  const events = (eventsResult.data ?? []) as EcosystemEvent[];
  const tasks = (tasksResult.data ?? []) as EcosystemTask[];
  const contacts = (contactsResult.data ?? []) as EcosystemContact[];
  const microtasks = (microtasksResult.data ?? []) as EcosystemMicroTask[];
  const commands = (commandsResult.data ?? []) as EcosystemAgentCommand[];
  const today = new Date().toISOString().slice(0, 10);

  return {
    events,
    tasks,
    contacts,
    microtasks,
    commands,
    degraded: false,
    source: 'supabase',
    kpis: {
      messagesSent: events.filter((event) => event.status === 'sent').length,
      failures: events.filter((event) => event.status === 'failed').length,
      openTasks: tasks.filter((task) => task.status !== 'done').length,
      contacts: contacts.length,
      webhooksToday: events.filter((event) => event.created_at.startsWith(today)).length,
      automationHealth: events.length === 0 ? 100 : Math.round((events.filter((event) => event.status !== 'failed').length / events.length) * 100),
      microtasksOpen: microtasks.filter((task) => task.status !== 'done').length,
      channelsActive: new Set(commands.filter((command) => command.enabled).map((command) => command.channel)).size,
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
