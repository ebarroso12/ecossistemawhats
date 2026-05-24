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
  updated_at timestamptz not null default now()
);

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
  updated_at timestamptz not null default now()
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
  updated_at timestamptz not null default now()
);

create index if not exists ecosystem_events_created_at_idx on public.ecosystem_events (created_at desc);
create index if not exists ecosystem_events_source_status_idx on public.ecosystem_events (source, status);
create index if not exists ecosystem_contacts_last_seen_idx on public.ecosystem_contacts (last_seen_at desc);
create index if not exists ecosystem_tasks_status_priority_idx on public.ecosystem_tasks (status, priority);

alter table public.ecosystem_contacts enable row level security;
alter table public.ecosystem_events enable row level security;
alter table public.ecosystem_tasks enable row level security;
alter table public.ecosystem_messages enable row level security;

drop policy if exists "service role manages contacts" on public.ecosystem_contacts;
drop policy if exists "service role manages events" on public.ecosystem_events;
drop policy if exists "service role manages tasks" on public.ecosystem_tasks;
drop policy if exists "service role manages messages" on public.ecosystem_messages;

create policy "service role manages contacts" on public.ecosystem_contacts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages events" on public.ecosystem_events
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages tasks" on public.ecosystem_tasks
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "service role manages messages" on public.ecosystem_messages
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
