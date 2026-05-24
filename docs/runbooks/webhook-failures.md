# Runbook: Webhook Failures

## Sintomas

- Eventos duplicados.
- Eventos ausentes.
- `401` em Webflow.
- `500` em Supabase.
- Mensagem WhatsApp nao chegou.

## Diagnostico

1. Abrir `/api/health`.
2. Confirmar `database=supabase`.
3. Checar Vercel logs da rota `/api/webhooks/[source]`.
4. Validar segredo:
   - Webflow: `x-webflow-timestamp` + `x-webflow-signature`.
   - Outros: `Authorization: Bearer ...`.
5. Conferir `ecosystem_events.external_id`.
6. Conferir status em `ecosystem_messages`.

## Recuperacao

- Se duplicado: confirmar unique index `ecosystem_events_source_external_id_uidx`.
- Se Webflow falhar: verificar timestamp dentro de 5 minutos e segredo correto.
- Se Supabase falhar: aplicar `SUPABASE_SCHEMA.sql` novamente com `if not exists`.
- Se WhatsApp falhar: verificar OpenClaw Ecosystem Hub e janela/template.

## Escalada

Criar tarefa `critical` em `ecosystem_tasks` com:

- fonte;
- payload reduzido;
- erro;
- acao esperada;
- responsavel.
