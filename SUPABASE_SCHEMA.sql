create extension if not exists pgcrypto;

create table if not exists public.ecosystem_contacts (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  contact_key text not null,
  name text not null,
  phone text,
  email text,
  tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, contact_key)
);

create table if not exists public.ecosystem_events (
  id uuid primary key default gen_random_uuid(),
  external_id text,
  source text not null,
  kind text not null,
  title text not null,
  contact_name text not null default 'Contato nao informado',
  contact_phone text,
  summary text not null,
  status text not null default 'received',
  priority text not null default 'normal',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ecosystem_events_status_check check (status in ('received', 'queued', 'sent', 'failed')),
  constraint ecosystem_events_priority_check check (priority in ('critical', 'high', 'normal', 'low'))
);

create unique index if not exists ecosystem_events_source_external_id_uidx on public.ecosystem_events (source, external_id);

create table if not exists public.ecosystem_tasks (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.ecosystem_events(id) on delete cascade,
  title text not null,
  area text not null default 'operacional',
  status text not null default 'open',
  priority text not null default 'normal',
  due_at timestamptz,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ecosystem_tasks_status_check check (status in ('open', 'doing', 'done')),
  constraint ecosystem_tasks_priority_check check (priority in ('critical', 'high', 'normal', 'low'))
);

create table if not exists public.ecosystem_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.ecosystem_events(id) on delete set null,
  direction text not null default 'outbound',
  channel text not null default 'whatsapp',
  target text,
  body text not null,
  status text not null default 'queued',
  provider_response jsonb not null default '{}'::jsonb,
  error text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ecosystem_messages_direction_check check (direction in ('inbound', 'outbound')),
  constraint ecosystem_messages_channel_check check (channel in ('whatsapp', 'telegram', 'email', 'webhook', 'openclaw')),
  constraint ecosystem_messages_status_check check (status in ('queued', 'sent', 'failed', 'received'))
);

create table if not exists public.ecosystem_agents (
  id uuid primary key default gen_random_uuid(),
  agent_key text not null unique,
  name text not null,
  role text not null,
  channel_scope text[] not null default '{whatsapp,telegram,dashboard,openclaw}',
  status text not null default 'active',
  workspace_path text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ecosystem_agents_status_check check (status in ('active', 'paused', 'disabled'))
);

create table if not exists public.ecosystem_commands (
  id uuid primary key default gen_random_uuid(),
  channel text not null,
  command text not null,
  description text not null,
  agent_key text not null,
  permission_level text not null default 'read',
  output_contract text not null default '',
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (channel, command),
  constraint ecosystem_commands_channel_check check (channel in ('whatsapp', 'telegram')),
  constraint ecosystem_commands_permission_check check (permission_level in ('read', 'write', 'approval_required', 'admin'))
);

create table if not exists public.ecosystem_microtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.ecosystem_tasks(id) on delete set null,
  event_id uuid references public.ecosystem_events(id) on delete set null,
  agent_key text not null,
  channel text not null default 'openclaw',
  title text not null,
  objective text not null,
  checklist jsonb not null default '[]'::jsonb,
  status text not null default 'queued',
  priority text not null default 'normal',
  input_contract jsonb not null default '{}'::jsonb,
  output_contract text not null default '',
  evidence jsonb not null default '{}'::jsonb,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ecosystem_microtasks_channel_check check (channel in ('whatsapp', 'telegram', 'dashboard', 'openclaw')),
  constraint ecosystem_microtasks_status_check check (status in ('queued', 'doing', 'blocked', 'done', 'failed')),
  constraint ecosystem_microtasks_priority_check check (priority in ('critical', 'high', 'normal', 'low'))
);

create index if not exists ecosystem_events_created_at_idx on public.ecosystem_events (created_at desc);
create index if not exists ecosystem_events_source_status_idx on public.ecosystem_events (source, status);
create index if not exists ecosystem_events_payload_gin_idx on public.ecosystem_events using gin (payload);
create index if not exists ecosystem_contacts_last_seen_idx on public.ecosystem_contacts (last_seen_at desc);
create index if not exists ecosystem_tasks_status_priority_idx on public.ecosystem_tasks (status, priority);
create index if not exists ecosystem_tasks_event_id_idx on public.ecosystem_tasks (event_id);
create index if not exists ecosystem_tasks_created_at_idx on public.ecosystem_tasks (created_at desc);
create index if not exists ecosystem_messages_event_id_idx on public.ecosystem_messages (event_id);
create index if not exists ecosystem_agents_status_idx on public.ecosystem_agents (status);
create index if not exists ecosystem_commands_channel_enabled_idx on public.ecosystem_commands (channel, enabled);
create index if not exists ecosystem_microtasks_status_priority_idx on public.ecosystem_microtasks (status, priority);
create index if not exists ecosystem_microtasks_agent_channel_idx on public.ecosystem_microtasks (agent_key, channel);
create index if not exists ecosystem_microtasks_due_at_idx on public.ecosystem_microtasks (due_at);

alter table public.ecosystem_contacts enable row level security;
alter table public.ecosystem_events enable row level security;
alter table public.ecosystem_tasks enable row level security;
alter table public.ecosystem_messages enable row level security;
alter table public.ecosystem_agents enable row level security;
alter table public.ecosystem_commands enable row level security;
alter table public.ecosystem_microtasks enable row level security;

drop policy if exists "service role manages contacts" on public.ecosystem_contacts;
drop policy if exists "service role manages events" on public.ecosystem_events;
drop policy if exists "service role manages tasks" on public.ecosystem_tasks;
drop policy if exists "service role manages messages" on public.ecosystem_messages;
drop policy if exists "service role manages agents" on public.ecosystem_agents;
drop policy if exists "service role manages commands" on public.ecosystem_commands;
drop policy if exists "service role manages microtasks" on public.ecosystem_microtasks;

create policy "service role manages contacts" on public.ecosystem_contacts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages events" on public.ecosystem_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages tasks" on public.ecosystem_tasks
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages messages" on public.ecosystem_messages
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages agents" on public.ecosystem_agents
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages commands" on public.ecosystem_commands
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages microtasks" on public.ecosystem_microtasks
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

insert into public.ecosystem_agents (agent_key, name, role, channel_scope, workspace_path, metadata)
values
  ('openclaw-router', 'OpenClaw Router', 'Quebra pedidos em microtarefas e escolhe agentes.', '{whatsapp,telegram,dashboard,openclaw}', '/workspace/router', '{"risk":"approval gateway"}'),
  ('secretario-clinica', 'Secretario Clinica', 'Agenda, pacientes, pendencias, aniversarios e comunicacao operacional.', '{whatsapp,telegram,dashboard}', '/workspace/secretaria', '{"daily_brief":"07:30"}'),
  ('estoque-injetaveis', 'Estoque Injetaveis', 'Saldo minimo, vencimento, reposicao e itens sem lancamento.', '{whatsapp,telegram,dashboard}', '/workspace/estoque', '{"domain":"injectables"}'),
  ('crm-pacientes', 'CRM Pacientes', 'Leads, follow-up, aniversarios, protocolos e retornos.', '{whatsapp,telegram,dashboard}', '/workspace/crm', '{"domain":"patients"}'),
  ('financeiro-clinica', 'Financeiro Clinica', 'Entradas, saidas, atrasos, alertas e previsao de caixa.', '{whatsapp,telegram,dashboard}', '/workspace/financeiro', '{"domain":"finance"}'),
  ('fireflies-memoria', 'Fireflies Memoria', 'Reunioes, decisoes, tarefas e memoria permanente.', '{telegram,dashboard,openclaw}', '/workspace/memoria', '{"source":"fireflies"}')
on conflict (agent_key) do update set
  name = excluded.name,
  role = excluded.role,
  channel_scope = excluded.channel_scope,
  workspace_path = excluded.workspace_path,
  metadata = excluded.metadata,
  updated_at = now();

insert into public.ecosystem_commands (channel, command, description, agent_key, permission_level, output_contract)
values
  ('whatsapp', '/hoje', 'Resumo do dia com agenda, pacientes, estoque, financeiro e pendencias.', 'secretario-clinica', 'read', 'Resumo executivo em ate 12 linhas.'),
  ('telegram', '/hoje', 'Resumo do dia com agenda, pacientes, estoque, financeiro e pendencias.', 'secretario-clinica', 'read', 'Resumo executivo em ate 12 linhas.'),
  ('whatsapp', '/estoque', 'Itens criticos, vencimentos, reposicao e falta de lancamento.', 'estoque-injetaveis', 'read', 'Tabela compacta com prioridade.'),
  ('telegram', '/estoque', 'Itens criticos, vencimentos, reposicao e falta de lancamento.', 'estoque-injetaveis', 'read', 'Tabela compacta com prioridade.'),
  ('whatsapp', '/pacientes', 'Pacientes sem retorno, aniversarios e protocolos.', 'crm-pacientes', 'read', 'Lista priorizada com contato, motivo e proxima acao.'),
  ('telegram', '/pacientes', 'Pacientes sem retorno, aniversarios e protocolos.', 'crm-pacientes', 'read', 'Lista priorizada com contato, motivo e proxima acao.'),
  ('whatsapp', '/financeiro', 'Entradas, saidas, atrasos e alertas financeiros.', 'financeiro-clinica', 'read', 'Resumo com saldo, riscos e pendencias.'),
  ('telegram', '/financeiro', 'Entradas, saidas, atrasos e alertas financeiros.', 'financeiro-clinica', 'read', 'Resumo com saldo, riscos e pendencias.'),
  ('whatsapp', '/tarefas', 'Fila por prioridade e agente.', 'openclaw-router', 'read', 'Lista por prioridade, agente e bloqueio.'),
  ('telegram', '/tarefas', 'Fila por prioridade e agente.', 'openclaw-router', 'read', 'Lista por prioridade, agente e bloqueio.'),
  ('whatsapp', '/delegar', 'Transforma pedido livre em microtarefas para agentes.', 'openclaw-router', 'approval_required', 'Plano, responsavel, prazo e confirmacao.'),
  ('telegram', '/delegar', 'Transforma pedido livre em microtarefas para agentes.', 'openclaw-router', 'approval_required', 'Plano, responsavel, prazo e confirmacao.'),
  ('whatsapp', '/enviar', 'Envia mensagem para paciente somente com aprovacao e politica de janela.', 'secretario-clinica', 'approval_required', 'Destino, texto, regra WhatsApp e comprovante.'),
  ('telegram', '/status', 'Estado dos webhooks, filas, deploy, banco e OpenClaw.', 'openclaw-router', 'read', 'OK/risco/falha por servico.'),
  ('whatsapp', '/resumir', 'Resumo de reunioes, decisoes e tarefas.', 'fireflies-memoria', 'read', 'Decisoes, tarefas, donos e memoria permanente.'),
  ('telegram', '/resumir', 'Resumo de reunioes, decisoes e tarefas.', 'fireflies-memoria', 'read', 'Decisoes, tarefas, donos e memoria permanente.')
on conflict (channel, command) do update set
  description = excluded.description,
  agent_key = excluded.agent_key,
  permission_level = excluded.permission_level,
  output_contract = excluded.output_contract,
  enabled = true,
  updated_at = now();
