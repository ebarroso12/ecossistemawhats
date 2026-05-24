import { NextRequest, NextResponse } from 'next/server';
import { eventKeyFromRawBody, getSupabaseAdmin, verifyBearer } from '@/lib';

type Channel = 'whatsapp' | 'telegram';
type PermissionLevel = 'read' | 'write' | 'approval_required' | 'admin';

type CommandBody = {
  channel?: Channel;
  from?: string;
  chatId?: string;
  text?: string;
  message?: string;
  contactName?: string;
  payload?: Record<string, unknown>;
};

const commandCatalog: Record<string, {
  agent_key: string;
  permission_level: PermissionLevel;
  description: string;
  output_contract: string;
  checklist: string[];
  priority: 'critical' | 'high' | 'normal' | 'low';
}> = {
  '/hoje': {
    agent_key: 'secretario-clinica',
    permission_level: 'read',
    description: 'Resumo do dia com agenda, pacientes, estoque, financeiro e pendencias.',
    output_contract: 'Resumo executivo em blocos: Hoje, Riscos, Acoes, Precisa aprovar.',
    checklist: ['Consultar agenda', 'Checar pacientes pendentes', 'Conferir estoque critico', 'Enviar resumo'],
    priority: 'critical',
  },
  '/estoque': {
    agent_key: 'estoque-injetaveis',
    permission_level: 'read',
    description: 'Itens criticos, vencimentos, reposicao e falta de lancamento.',
    output_contract: 'Tabela com item, saldo, minimo, vencimento e acao.',
    checklist: ['Consultar inventario', 'Comparar minimo', 'Separar vencimentos', 'Criar tarefa de compra'],
    priority: 'high',
  },
  '/pacientes': {
    agent_key: 'crm-pacientes',
    permission_level: 'read',
    description: 'Pacientes sem retorno, aniversarios e protocolos.',
    output_contract: 'Lista priorizada com contato, motivo e proxima acao.',
    checklist: ['Consultar CRM', 'Identificar pendencias', 'Checar aniversarios', 'Sugerir proximas acoes'],
    priority: 'high',
  },
  '/financeiro': {
    agent_key: 'financeiro-clinica',
    permission_level: 'read',
    description: 'Entradas, saidas, atrasos e alertas financeiros.',
    output_contract: 'Resumo com saldo, riscos e pendencias.',
    checklist: ['Consultar movimentacoes', 'Checar atrasos', 'Calcular riscos', 'Gerar resumo'],
    priority: 'high',
  },
  '/tarefas': {
    agent_key: 'openclaw-router',
    permission_level: 'read',
    description: 'Fila por prioridade e agente.',
    output_contract: 'Lista por prioridade, agente e bloqueio.',
    checklist: ['Ler tarefas abertas', 'Agrupar por agente', 'Destacar bloqueios', 'Responder fila'],
    priority: 'normal',
  },
  '/delegar': {
    agent_key: 'openclaw-router',
    permission_level: 'approval_required',
    description: 'Transforma pedido livre em microtarefas.',
    output_contract: 'Plano com agente, checklist, prazo e confirmacao.',
    checklist: ['Interpretar pedido', 'Quebrar em microtarefas', 'Definir agente', 'Pedir aprovacao'],
    priority: 'normal',
  },
  '/enviar': {
    agent_key: 'secretario-clinica',
    permission_level: 'approval_required',
    description: 'Prepara mensagem externa para paciente.',
    output_contract: 'Destino, texto, regra WhatsApp e comprovante apos aprovacao.',
    checklist: ['Validar contato', 'Validar janela WhatsApp', 'Preparar texto', 'Pedir aprovacao'],
    priority: 'high',
  },
  '/status': {
    agent_key: 'openclaw-router',
    permission_level: 'read',
    description: 'Estado de Vercel, Supabase, OpenClaw e filas.',
    output_contract: 'OK/risco/falha por servico.',
    checklist: ['Checar health', 'Checar filas', 'Checar falhas', 'Responder status'],
    priority: 'normal',
  },
  '/resumir': {
    agent_key: 'fireflies-memoria',
    permission_level: 'read',
    description: 'Resumo de reunioes, decisoes e tarefas.',
    output_contract: 'Decisoes, tarefas, donos e memoria permanente.',
    checklist: ['Buscar periodo', 'Extrair decisoes', 'Criar tarefas', 'Salvar memoria'],
    priority: 'normal',
  },
};

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: CommandBody;
  try {
    body = JSON.parse(rawBody || '{}') as CommandBody;
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 });
  }

  const channel = body.channel;
  if (channel !== 'whatsapp' && channel !== 'telegram') {
    return NextResponse.json({ error: 'channel must be whatsapp or telegram' }, { status: 400 });
  }

  const actor = channel === 'telegram' ? body.chatId : body.from;
  if (!actor || !isAllowedActor(channel, actor)) {
    return NextResponse.json({ error: 'actor not allowed' }, { status: 403 });
  }

  const text = (body.text || body.message || '').trim();
  const commandName = text.split(/\s+/)[0]?.toLowerCase();
  const command = commandCatalog[commandName];
  if (!command) {
    return NextResponse.json({
      error: 'unknown command',
      available: Object.keys(commandCatalog),
    }, { status: 400 });
  }

  const now = new Date().toISOString();
  const externalId = eventKeyFromRawBody(`${channel}:${actor}:${rawBody}`);
  const title = `Comando ${commandName} recebido`;
  const summary = `${command.description} Origem: ${channel}.`;

  const event = {
    external_id: externalId,
    source: channel,
    kind: 'agent_command',
    title,
    contact_name: body.contactName || actor,
    contact_phone: channel === 'whatsapp' ? actor : null,
    summary,
    status: 'queued',
    priority: command.priority,
    payload: { ...body.payload, command: commandName, text, actor, permission_level: command.permission_level },
  };

  const microtask = {
    agent_key: command.agent_key,
    channel,
    title,
    objective: command.description,
    checklist: command.checklist,
    status: command.permission_level === 'approval_required' ? 'blocked' : 'queued',
    priority: command.priority,
    input_contract: { command: commandName, text, actor },
    output_contract: command.output_contract,
    evidence: { created_by: 'api/commands', received_at: now },
    due_at: command.priority === 'critical' ? now : null,
  };

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      ok: true,
      stored: false,
      event,
      microtask,
      approval_required: command.permission_level === 'approval_required',
    }, { status: 202 });
  }

  const { data: storedEvent, error: eventError } = await supabase
    .from('ecosystem_events')
    .upsert(event, { onConflict: 'source,external_id' })
    .select('id')
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  const { data: storedMicrotask, error: microtaskError } = await supabase
    .from('ecosystem_microtasks')
    .insert({ ...microtask, event_id: storedEvent.id })
    .select('id')
    .single();

  if (microtaskError) {
    return NextResponse.json({ error: microtaskError.message, event_id: storedEvent.id }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    stored: true,
    event_id: storedEvent.id,
    microtask_id: storedMicrotask.id,
    approval_required: command.permission_level === 'approval_required',
  }, { status: 202 });
}

function isAuthorized(request: NextRequest): boolean {
  if (verifyBearer(request)) return true;

  const telegramSecret = process.env.OPENCLAW_TELEGRAM_WEBHOOK_SECRET;
  const telegramHeader = request.headers.get('x-telegram-bot-api-secret-token');
  return Boolean(telegramSecret && telegramHeader && telegramHeader === telegramSecret);
}

function isAllowedActor(channel: Channel, actor: string): boolean {
  const envName = channel === 'telegram' ? 'TELEGRAM_ALLOWED_CHAT_IDS' : 'WHATSAPP_ALLOWED_NUMBERS';
  const allowed = (process.env[envName] || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowed.length === 0) return process.env.VERCEL !== '1';
  return allowed.includes(actor);
}
