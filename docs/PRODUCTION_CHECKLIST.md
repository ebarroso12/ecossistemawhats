# Checklist de Producao

## Vercel

- Projeto: `edsonbarroso-7705s-projects/ecossistemawhats`
- URL: `https://ecossistemawhats.vercel.app`
- Build: `npm run build`

Variaveis obrigatorias:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_WEBHOOK_SECRET`
- `WEBFLOW_WEBHOOK_SECRET`
- `OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_URL`
- `OPENCLAW_ECOSYSTEM_HUB_WEBHOOK_SECRET`
- `WHATSAPP_DEFAULT_TO`

## Supabase

1. Abrir SQL editor.
2. Rodar `SUPABASE_SCHEMA.sql`.
3. Confirmar RLS ativo nas quatro tabelas.
4. Testar `/api/health`.
5. Esperado: `database=supabase`.

## Webflow

Endpoint:

`https://ecossistemawhats.vercel.app/api/webhooks/webflow`

Validacao:

- `x-webflow-signature` com HMAC SHA-256.
- Idempotencia por `id`, `eventId` ou `webhookId`.

## WhatsApp

Fluxo atual:

`ecossistemawhats` -> `OpenClaw Ecosystem Hub` -> `OpenClaw` -> `WhatsApp`

Regra:

- Livre dentro da janela de 24h.
- Template aprovado fora da janela, quando usar WhatsApp Business API oficial.

## Teste Rapido

```bash
curl https://ecossistemawhats.vercel.app/api/health
```

```bash
curl -X POST https://ecossistemawhats.vercel.app/api/webhooks/openclaw \
  -H "Authorization: Bearer $SUPABASE_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d "{\"id\":\"test-1\",\"kind\":\"smoke\",\"title\":\"Smoke test\",\"summary\":\"Evento de teste\"}"
```
