# Ecossistema Whats Dr. Edson Barroso

Dashboard Vercel para operar o segundo cerebro do ecossistema Dr. Edson.

## Funcao

- CRM central de contatos.
- Linha do tempo de webhooks.
- Controle de tarefas operacionais.
- Microtarefas detalhadas por agente OpenClaw.
- Ponte para WhatsApp via OpenClaw.
- Comandos por WhatsApp e Telegram.
- Entrada para Webflow Events com assinatura HMAC.
- Base pronta para Fireflies e Carta CRM.
- Banco Supabase com RLS, indexes e service-role server-side.

## Rotas

- `/` dashboard operacional.
- `/api/health` healthcheck.
- `/api/events` leitura agregada.
- `/api/webhooks/[source]` entrada autenticada de webhooks.
- `/api/messages/send` envio manual para OpenClaw/WhatsApp.

## Supabase

Execute `SUPABASE_SCHEMA.sql` no SQL editor do Supabase.

Variaveis:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_WEBHOOK_SECRET`
- `WEBFLOW_WEBHOOK_SECRET`
- `OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_URL`
- `OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_SECRET`
- `WHATSAPP_DEFAULT_TO`
- `WHATSAPP_ALLOWED_NUMBERS`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ALLOWED_CHAT_IDS`
- `OPENCLAW_TELEGRAM_WEBHOOK_SECRET`

## Webflow

Endpoint:

`https://SEU_DOMINIO/api/webhooks/webflow`

Use `WEBFLOW_WEBHOOK_SECRET` para validar `x-webflow-signature`.

## WhatsApp

O app chama o OpenClaw Ecosystem Hub. Para WhatsApp Business API oficial via Rube/Composio, manter a regra:

1. listar numeros oficiais;
2. enviar livre apenas dentro da janela de 24h;
3. fora da janela, usar template aprovado.

## Telegram

Telegram deve operar como canal de comando rapido para o mesmo hub. Todo chat precisa estar em `TELEGRAM_ALLOWED_CHAT_IDS`; comando recebido vira evento e microtarefa antes de execucao.

Comandos principais:

- `/hoje`
- `/estoque`
- `/pacientes`
- `/financeiro`
- `/tarefas`
- `/delegar`
- `/status`
- `/resumir`

## Microtarefas

Toda acao do agente segue o contrato em `docs/contracts/microtasks.md`: objetivo, checklist, prioridade, permissao, saida esperada e evidencia. A operacao diaria esta em `docs/runbooks/daily-right-hand.md`.

## OpenClaw Workspace

Este dashboard e a memoria do ecossistema devem espelhar a organizacao:

- contatos e eventos como memoria semantica;
- tarefas como memoria procedural;
- falhas e reprocessamentos como memoria episodica;
- microtarefas como execucao diaria;
- agentes por area: WhatsApp, Telegram, Webflow, Fireflies, CRM, financeiro, estoque e clinica.
