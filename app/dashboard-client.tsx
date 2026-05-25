'use client';

import { FormEvent, ReactNode, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  Database,
  GitBranch,
  Globe2,
  KeyRound,
  Lock,
  MessageSquareText,
  Mic,
  Radio,
  Save,
  Search,
  Send,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow,
} from 'lucide-react';
import type { DashboardData, EcosystemEvent, EcosystemOpsStatus } from '@/lib';

type TabKey = 'visao' | 'conversas' | 'webhooks' | 'contatos' | 'tarefas' | 'microtarefas' | 'automacoes' | 'banco' | 'configuracoes';
type AuthSaveState = 'idle' | 'saving' | 'saved' | 'error';

const navItems: Array<{ key: TabKey; label: string; icon: typeof Activity }> = [
  { key: 'visao', label: 'Visao geral', icon: Activity },
  { key: 'conversas', label: 'Conversas', icon: MessageSquareText },
  { key: 'webhooks', label: 'Webhooks', icon: Radio },
  { key: 'contatos', label: 'Contatos', icon: UserRound },
  { key: 'tarefas', label: 'Tarefas', icon: CalendarClock },
  { key: 'microtarefas', label: 'Microtarefas', icon: Bot },
  { key: 'automacoes', label: 'Automacoes', icon: Workflow },
  { key: 'banco', label: 'Banco de dados', icon: Database },
  { key: 'configuracoes', label: 'Configuracoes', icon: Settings },
];

const automations = [
  { name: 'WhatsApp', icon: MessageSquareText, status: 'Operacional', detail: 'OpenClaw entrega mensagens e usa fallback pelo hub.' },
  { name: 'Webflow', icon: Globe2, status: 'HMAC ativo', detail: 'Formularios, publicacoes e eventos entram por webhook.' },
  { name: 'Fireflies', icon: Mic, status: 'Preparado', detail: 'Reunioes viram tarefas e memoria operacional.' },
  { name: 'CRM', icon: UserRound, status: 'Preparado', detail: 'Contatos, pipeline e retornos em uma fila.' },
  { name: 'Supabase', icon: Database, status: 'Schema pronto', detail: 'Postgres, RLS, indices e dados do painel.' },
  { name: 'OpenClaw', icon: Bot, status: 'Agentes IA', detail: 'Workspace, memoria e execucao assistida.' },
];

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value);
}

function statusClass(status: EcosystemEvent['status']) {
  if (status === 'sent') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (status === 'failed') return 'bg-red-50 text-red-700 border-red-200';
  if (status === 'queued') return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-sky-50 text-sky-700 border-sky-200';
}

function statusText(status: string) {
  const map: Record<string, string> = {
    sent: 'enviado',
    failed: 'falhou',
    queued: 'na fila',
    received: 'recebido',
    open: 'aberta',
    doing: 'em andamento',
    done: 'concluida',
    blocked: 'bloqueada',
    critical: 'critica',
    high: 'alta',
    normal: 'normal',
    low: 'baixa',
    ok: 'ok',
    warn: 'atencao',
    fail: 'falha',
    active: 'ativo',
    watch: 'monitorar',
  };
  return map[status] ?? status;
}

function opsClass(status: EcosystemOpsStatus['status']) {
  if (status === 'ok') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'fail') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function Panel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</section>;
}

function PanelHeader({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="border-b border-slate-200 px-4 py-3">
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      {detail && <p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p>}
    </div>
  );
}

export function DashboardClient({ data }: { data: DashboardData }) {
  const [activeTab, setActiveTab] = useState<TabKey>('visao');
  const [query, setQuery] = useState('');
  const [authState, setAuthState] = useState<AuthSaveState>('idle');
  const [authMessage, setAuthMessage] = useState('');
  const selected = data.events[0];

  const filteredEvents = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return data.events;
    return data.events.filter((event) =>
      [event.source, event.title, event.kind, event.contact_name, event.summary].some((value) => value?.toLowerCase().includes(term)),
    );
  }, [data.events, query]);

  async function saveAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthState('saving');
    setAuthMessage('');

    const form = new FormData(event.currentTarget);
    const payload = {
      currentPassword: String(form.get('currentPassword') || ''),
      adminUser: String(form.get('adminUser') || ''),
      newPassword: String(form.get('newPassword') || ''),
      confirmPassword: String(form.get('confirmPassword') || ''),
    };

    const response = await fetch('/api/settings/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({ error: 'Resposta invalida do servidor.' })) as { ok?: boolean; message?: string; error?: string };

    if (!response.ok || !result.ok) {
      setAuthState('error');
      setAuthMessage(result.error || 'Nao foi possivel salvar.');
      return;
    }

    setAuthState('saved');
    setAuthMessage(result.message || 'Credenciais atualizadas.');
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-[248px_1fr] max-lg:grid-cols-1">
        <aside className="border-r border-slate-200 bg-white px-4 py-5 max-lg:hidden">
          <div className="mb-7 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-700 text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Ecossistema Whats</p>
              <p className="text-xs text-slate-500">Dr. Edson Barroso</p>
            </div>
          </div>

          <nav className="space-y-1" aria-label="Navegacao principal">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                  activeTab === key ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
              <ShieldCheck size={15} className="text-teal-700" />
              Workspace OpenClaw
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Memoria, agentes, eventos e tarefas organizados como segundo cerebro operacional.
            </p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
              <div>
                <h1 className="text-xl font-bold tracking-tight">Central de comando do segundo cerebro</h1>
                <p className="text-sm text-slate-500">Painel em portugues para WhatsApp, webhooks, pacientes, tarefas, agentes e seguranca.</p>
              </div>
              <div className="flex items-center gap-2 max-md:flex-wrap">
                <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  Supabase {data.source === 'supabase' ? 'ativo' : 'demo'}
                </div>
                <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                  <GitBranch size={15} className="text-blue-600" />
                  Vercel online
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('configuracoes')}
                  className="flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white"
                >
                  <Settings size={15} />
                  Configurar
                </button>
              </div>
            </div>
            <div className="mt-4 hidden gap-2 overflow-x-auto max-lg:flex">
              {navItems.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`h-9 shrink-0 rounded-lg border px-3 text-sm font-semibold ${
                    activeTab === key ? 'border-teal-700 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div className="space-y-5 p-6">
            {data.degraded && (
              <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Banco Supabase em modo demonstracao neste deploy. Configure variaveis e schema para dados reais.
              </section>
            )}

            {activeTab === 'visao' && (
              <>
                <Kpis data={data} />
                <OperationalHealth data={data} />
                <AgentsAndRoutines data={data} />
              </>
            )}

            {activeTab === 'conversas' && (
              <div className="grid grid-cols-[1fr_360px] gap-5 max-xl:grid-cols-1">
                <EventsTable events={filteredEvents} query={query} setQuery={setQuery} />
                <ConversationPanel selected={selected} />
              </div>
            )}

            {activeTab === 'webhooks' && <EventsTable events={filteredEvents} query={query} setQuery={setQuery} title="Eventos e webhooks" />}

            {activeTab === 'contatos' && (
              <Panel>
                <PanelHeader title="Contatos" detail="Pacientes, leads e contatos operacionais recebidos pelos canais." />
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[680px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                        <th className="px-4 py-3">Nome</th>
                        <th className="px-4 py-3">Telefone</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Origem</th>
                        <th className="px-4 py-3">Ultimo contato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.contacts.map((contact) => (
                        <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold">{contact.name}</td>
                          <td className="px-4 py-3 text-slate-600">{contact.phone || 'Nao informado'}</td>
                          <td className="px-4 py-3 text-slate-600">{contact.email || 'Nao informado'}</td>
                          <td className="px-4 py-3 text-slate-600">{contact.source}</td>
                          <td className="px-4 py-3 text-slate-600">{new Date(contact.last_seen_at).toLocaleString('pt-BR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Panel>
            )}

            {activeTab === 'tarefas' && <TasksPanel data={data} />}
            {activeTab === 'microtarefas' && <MicrotasksPanel data={data} />}
            {activeTab === 'automacoes' && <AutomationsPanel data={data} />}
            {activeTab === 'banco' && <DatabasePanel data={data} />}
            {activeTab === 'configuracoes' && (
              <SettingsPanel authState={authState} authMessage={authMessage} onSaveAuth={saveAuth} />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Kpis({ data }: { data: DashboardData }) {
  const items = [
    ['Mensagens', fmt(data.kpis.messagesSent), MessageSquareText, 'WhatsApp enviados'],
    ['Falhas', fmt(data.kpis.failures), AlertTriangle, 'Exigem acao'],
    ['Tarefas', fmt(data.kpis.openTasks), CalendarClock, 'Abertas agora'],
    ['Contatos', fmt(data.kpis.contacts), UserRound, 'No CRM'],
    ['Webhooks hoje', fmt(data.kpis.webhooksToday), Radio, 'Eventos recebidos'],
    ['Microtarefas', fmt(data.kpis.microtasksOpen), Bot, 'Na fila dos agentes'],
    ['Canais', fmt(data.kpis.channelsActive), Send, 'WhatsApp e Telegram'],
    ['Saude', `${data.kpis.automationHealth}%`, ShieldCheck, 'Automacoes OK'],
  ] as const;

  return (
    <section className="grid grid-cols-6 gap-3 max-xl:grid-cols-3 max-md:grid-cols-1">
      {items.map(([label, value, Icon, detail]) => (
        <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <Icon size={17} className="text-teal-700" />
          </div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
      ))}
    </section>
  );
}

function OperationalHealth({ data }: { data: DashboardData }) {
  return (
    <Panel className="p-4">
      <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
        <div>
          <h2 className="text-sm font-bold">Saude operacional</h2>
          <p className="text-xs text-slate-500">Vercel, OpenClaw publico e canais validados para operacao do WhatsApp.</p>
        </div>
        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
          {data.ops[0]?.checked_at ? new Date(data.ops[0].checked_at).toLocaleString('pt-BR') : 'Sem leitura'}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-3 max-xl:grid-cols-2 max-md:grid-cols-1">
        {data.ops.map((item) => (
          <div key={item.service} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Server size={17} className="text-teal-700" />
                <p className="text-sm font-bold text-slate-900">{item.service}</p>
              </div>
              <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase ${opsClass(item.status)}`}>
                {statusText(item.status)}
              </span>
            </div>
            <p className="text-xs leading-5 text-slate-600">{item.detail}</p>
            <p className="mt-2 text-[11px] font-medium text-slate-500">{item.evidence}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AgentsAndRoutines({ data }: { data: DashboardData }) {
  return (
    <section className="grid grid-cols-[1.2fr_0.8fr] gap-5 max-xl:grid-cols-1">
      <Panel className="p-4">
        <div className="mb-4 flex items-center justify-between gap-3 max-md:flex-col max-md:items-start">
          <div>
            <h2 className="text-sm font-bold">Agentes OpenClaw no VPS</h2>
            <p className="text-xs text-slate-500">Inventario validado: 66 agentes. Lista principal visivel abaixo.</p>
          </div>
          <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">66 ativos</span>
        </div>
        <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
          {data.agents.map((agent) => (
            <div key={agent.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{agent.current_name}</p>
                  <p className="text-[11px] font-semibold text-teal-700">{agent.id}</p>
                </div>
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase text-emerald-700">
                  {statusText(agent.status)}
                </span>
              </div>
              {agent.previous_name && <p className="text-xs leading-5 text-slate-600">Antes: {agent.previous_name}</p>}
              <p className="mt-1 text-[11px] text-slate-500">{agent.workspace} - {agent.area}</p>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <CalendarClock size={18} className="text-teal-700" />
          <h2 className="text-sm font-bold">Rotinas automaticas</h2>
        </div>
        <div className="space-y-3">
          {data.routines.map((routine) => (
            <div key={routine.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-bold text-slate-900">{routine.name}</p>
                  <p className="text-xs text-slate-500">{routine.schedule}</p>
                </div>
                <span className={`rounded-md border px-2 py-1 text-[11px] font-semibold uppercase ${opsClass(routine.status === 'watch' ? 'warn' : routine.status)}`}>
                  {statusText(routine.status)}
                </span>
              </div>
              <p className="text-xs leading-5 text-slate-600">{routine.detail}</p>
              <p className="mt-2 text-[11px] font-medium text-slate-500">{routine.agent_id} - {routine.channel}</p>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function EventsTable({
  events,
  query,
  setQuery,
  title = 'Linha do tempo operacional',
}: {
  events: EcosystemEvent[];
  query: string;
  setQuery: (value: string) => void;
  title?: string;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 max-md:flex-col max-md:items-stretch">
        <div>
          <h2 className="text-sm font-bold">{title}</h2>
          <p className="text-xs text-slate-500">Eventos que alimentam memoria, contatos, tarefas e conversas.</p>
        </div>
        <label className="flex h-9 w-72 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 max-md:w-full">
          <Search size={15} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
            placeholder="Buscar evento ou contato"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Evento</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Resumo</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-700">{event.source}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{event.title}</p>
                  <p className="text-xs text-slate-500">{event.kind}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{event.contact_name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusClass(event.status)}`}>
                    {statusText(event.status)}
                  </span>
                </td>
                <td className="max-w-md px-4 py-3 text-slate-600">{event.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function ConversationPanel({ selected }: { selected?: EcosystemEvent }) {
  return (
    <aside className="space-y-5">
      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <MessageSquareText size={18} className="text-teal-700" />
          <h2 className="text-sm font-bold">Conversa selecionada</h2>
        </div>
        <p className="text-sm font-semibold">{selected?.contact_name ?? 'Sem contato'}</p>
        <p className="mt-1 text-xs text-slate-500">{selected?.contact_phone ?? 'Sem telefone'}</p>
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
          {selected?.summary ?? 'Nenhum evento selecionado.'}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">Enviar</button>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Criar tarefa</button>
        </div>
      </Panel>
    </aside>
  );
}

function TasksPanel({ data }: { data: DashboardData }) {
  return (
    <Panel>
      <PanelHeader title="Tarefas abertas" detail="Pendencias operacionais separadas por area, status e prioridade." />
      <div className="grid grid-cols-3 gap-3 p-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        {data.tasks.map((task) => (
          <div key={task.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-bold text-slate-900">{task.title}</p>
            <p className="mt-2 text-xs text-slate-500">{task.area}</p>
            <div className="mt-3 flex gap-2">
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700">{statusText(task.status)}</span>
              <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-700">{statusText(task.priority)}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function MicrotasksPanel({ data }: { data: DashboardData }) {
  return (
    <Panel>
      <PanelHeader title="Fila de microtarefas dos agentes" detail="Cada pedido vira tarefa pequena, auditavel e com saida esperada." />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Agente</th>
              <th className="px-4 py-3">Canal</th>
              <th className="px-4 py-3">Microtarefa</th>
              <th className="px-4 py-3">Checklist</th>
              <th className="px-4 py-3">Saida</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.microtasks.map((task) => (
              <tr key={task.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-700">{task.agent_key}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">{task.channel}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{task.objective}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{task.checklist.length} passos</td>
                <td className="max-w-sm px-4 py-3 text-slate-600">{task.output_contract}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                    {statusText(task.status)} - {statusText(task.priority)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AutomationsPanel({ data }: { data: DashboardData }) {
  return (
    <div className="space-y-5">
      <OperationalHealth data={data} />
      <Panel className="p-4">
        <div className="mb-4">
          <h2 className="text-sm font-bold">Fluxos do ecossistema</h2>
          <p className="text-xs text-slate-500">Cada bloco vira memoria, contato, tarefa ou conversa.</p>
        </div>
        <div className="grid grid-cols-6 gap-3 max-xl:grid-cols-3 max-md:grid-cols-1">
          {automations.map(({ name, icon: Icon, status, detail }) => (
            <div key={name} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Icon size={18} className="mb-3 text-blue-700" />
              <p className="text-sm font-bold">{name}</p>
              <p className="mt-1 text-xs font-semibold text-teal-700">{status}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function DatabasePanel({ data }: { data: DashboardData }) {
  return (
    <Panel className="p-4">
      <div className="mb-4 flex items-center gap-2">
        <Database size={18} className="text-teal-700" />
        <h2 className="text-sm font-bold">Banco de dados</h2>
      </div>
      <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Fonte</p>
          <p className="mt-2 text-lg font-bold">{data.source === 'supabase' ? 'Supabase' : 'Dados de demonstracao'}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Eventos</p>
          <p className="mt-2 text-lg font-bold">{fmt(data.events.length)}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase text-slate-500">Comandos ativos</p>
          <p className="mt-2 text-lg font-bold">{fmt(data.commands.length)}</p>
        </div>
      </div>
    </Panel>
  );
}

function SettingsPanel({
  authState,
  authMessage,
  onSaveAuth,
}: {
  authState: AuthSaveState;
  authMessage: string;
  onSaveAuth: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_0.8fr] gap-5 max-xl:grid-cols-1">
      <Panel className="p-4">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={18} className="text-teal-700" />
          <h2 className="text-sm font-bold">Usuario e senha do painel</h2>
        </div>
        <form onSubmit={onSaveAuth} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Senha atual</span>
              <input name="currentPassword" type="password" required className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Novo usuario</span>
              <input name="adminUser" type="text" required minLength={3} placeholder="edson" className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Nova senha</span>
              <input name="newPassword" type="password" required minLength={10} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-600">Confirmar nova senha</span>
              <input name="confirmPassword" type="password" required minLength={10} className="mt-1 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-teal-700" />
            </label>
          </div>
          <button
            type="submit"
            disabled={authState === 'saving'}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white disabled:opacity-60"
          >
            <Save size={16} />
            {authState === 'saving' ? 'Salvando...' : 'Salvar credenciais'}
          </button>
          {authMessage && (
            <p className={`rounded-lg border px-3 py-2 text-sm ${authState === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
              {authMessage}
            </p>
          )}
        </form>
      </Panel>

      <Panel className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lock size={18} className="text-teal-700" />
          <h2 className="text-sm font-bold">Seguranca</h2>
        </div>
        <div className="space-y-3 text-sm leading-6 text-slate-600">
          <p>Senha nao aparece na tela e nao volta pela API.</p>
          <p>Alteracao em producao usa variaveis `ECOSYSTEM_ADMIN_USER` e `ECOSYSTEM_ADMIN_PASSWORD` do Vercel.</p>
          <p>Apos salvar, faca novo deploy para o proxy usar a nova credencial em todas as regioes.</p>
        </div>
      </Panel>
    </div>
  );
}
