# Ecossistema Whats Dr. Edson Barroso

Dashboard Vercel para operar o segundo cerebro do ecossistema Dr. Edson.

## Funcao

- CRM central de contatos.
- Linha do tempo de webhooks.
- Controle de tarefas operacionais.
- Ponte para WhatsApp via OpenClaw.
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

## Webflow

Endpoint:

`https://SEU_DOMINIO/api/webhooks/webflow`

Use `WEBFLOW_WEBHOOK_SECRET` para validar `x-webflow-signature`.

## WhatsApp

O app chama o OpenClaw Ecosystem Hub. Para WhatsApp Business API oficial via Rube/Composio, manter a regra:

1. listar numeros oficiais;
2. enviar livre apenas dentro da janela de 24h;
3. fora da janela, usar template aprovado.

## OpenClaw Workspace

Este dashboard e a memoria do ecossistema devem espelhar a organizacao:

- contatos e eventos como memoria semantica;
- tarefas como memoria procedural;
- falhas e reprocessamentos como memoria episodica;
- agentes por area: WhatsApp, Webflow, Fireflies, CRM, financeiro e clinica.
