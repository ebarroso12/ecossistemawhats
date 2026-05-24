import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  Database,
  GitBranch,
  Globe2,
  MessageSquareText,
  Mic,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Workflow,
} from 'lucide-react';
import { getDashboardData, type EcosystemEvent } from '@/lib';

const navItems = ['Overview', 'Conversations', 'Webhooks', 'Contacts', 'Tasks', 'Automations', 'Database', 'Settings'];

const automations = [
  { name: 'WhatsApp', icon: MessageSquareText, status: 'Operacional', detail: 'OpenClaw entrega e fallback por hub' },
  { name: 'Webflow', icon: Globe2, status: 'Assinatura HMAC', detail: 'Formularios, publish e ecommerce' },
  { name: 'Fireflies', icon: Mic, status: 'Preparado', detail: 'Reunioes viram tarefas e memoria' },
  { name: 'Carta CRM', icon: UserRound, status: 'Preparado', detail: 'Contatos e pipeline no segundo cerebro' },
  { name: 'Supabase', icon: Database, status: 'Schema pronto', detail: 'Postgres, RLS e indexes' },
  { name: 'OpenClaw', icon: Bot, status: 'Agentes IA', detail: 'Workspace, memoria e execucao' },
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

export default async function Home() {
  const data = await getDashboardData();
  const selected = data.events[0];

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

          <nav className="space-y-1">
            {navItems.map((item, index) => (
              <button
                key={item}
                className={`flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition ${
                  index === 0 ? 'bg-teal-50 font-semibold text-teal-800' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {index === 0 ? <Activity size={16} /> : index === 2 ? <Radio size={16} /> : index === 6 ? <Database size={16} /> : <Workflow size={16} />}
                {item}
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
          <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4 max-md:flex-col max-md:items-stretch">
            <div>
              <h1 className="text-xl font-bold tracking-tight">Central de Comando do Segundo Cerebro</h1>
              <p className="text-sm text-slate-500">CRM, webhooks, WhatsApp, Fireflies, Webflow, Supabase, Vercel e OpenClaw em uma tela.</p>
            </div>
            <div className="flex items-center gap-2 max-md:flex-wrap">
              <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-600" />
                Supabase pronto
              </div>
              <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                <GitBranch size={15} className="text-blue-600" />
                Vercel deploy
              </div>
              <button className="focus-ring flex h-9 items-center gap-2 rounded-lg bg-teal-700 px-3 text-sm font-semibold text-white">
                <Settings size={15} />
                Operar
              </button>
            </div>
          </header>

          <div className="space-y-5 p-6">
            {data.degraded && (
              <section className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                Banco Supabase ainda nao esta ativo neste deploy. O painel esta em modo demonstracao com dados de exemplo ate as variaveis e o schema serem configurados.
              </section>
            )}

            <section className="grid grid-cols-6 gap-3 max-xl:grid-cols-3 max-md:grid-cols-1">
              {[
                ['Mensagens', fmt(data.kpis.messagesSent), MessageSquareText, 'WhatsApp enviados'],
                ['Falhas', fmt(data.kpis.failures), AlertTriangle, 'Exigem acao'],
                ['Tarefas', fmt(data.kpis.openTasks), CalendarClock, 'Abertas agora'],
                ['Contatos', fmt(data.kpis.contacts), UserRound, 'No CRM'],
                ['Webhooks hoje', fmt(data.kpis.webhooksToday), Radio, 'Eventos recebidos'],
                ['Saude', `${data.kpis.automationHealth}%`, ShieldCheck, 'Automacoes OK'],
              ].map(([label, value, Icon, detail]) => (
                <div key={label as string} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label as string}</p>
                    <Icon size={17} className="text-teal-700" />
                  </div>
                  <p className="text-2xl font-bold">{value as string}</p>
                  <p className="mt-1 text-xs text-slate-500">{detail as string}</p>
                </div>
              ))}
            </section>

            <section className="grid grid-cols-[1fr_360px] gap-5 max-xl:grid-cols-1">
              <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                  <div>
                    <h2 className="text-sm font-bold">Linha do tempo operacional</h2>
                    <p className="text-xs text-slate-500">Todos os eventos que alimentam o segundo cerebro.</p>
                  </div>
                  <div className="flex h-9 w-64 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 max-md:hidden">
                    <Search size={15} />
                    Buscar evento, contato ou origem
                  </div>
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
                      {data.events.map((event) => (
                        <tr key={event.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-700">{event.source}</td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-900">{event.title}</p>
                            <p className="text-xs text-slate-500">{event.kind}</p>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{event.contact_name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${statusClass(event.status)}`}>
                              {event.status}
                            </span>
                          </td>
                          <td className="max-w-md px-4 py-3 text-slate-600">{event.summary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
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
                    <button className="focus-ring rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white">Enviar</button>
                    <button className="focus-ring rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Criar tarefa</button>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h2 className="mb-3 text-sm font-bold">Tarefas abertas</h2>
                  <div className="space-y-2">
                    {data.tasks.map((task) => (
                      <div key={task.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-slate-800">{task.title}</p>
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">{task.area}</span>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{task.status} · {task.priority}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </aside>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">Fluxos do ecossistema</h2>
                  <p className="text-xs text-slate-500">Cada bloco vira uma entrada de memoria, contato, tarefa ou conversa.</p>
                </div>
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
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
