# Project Checkpoint

Date: 2026-05-26

## Links

- Production: `https://ecossistemawhats.vercel.app`
- GitHub: `https://github.com/ebarroso12/ecossistemawhats`
- Local: `C:\Users\Cliente\ecossistemawhats`
- Desktop backup: `C:\Users\Cliente\Desktop\ecossistemawhats`

## Saved State

- Previous saved commit: `bf5d9ad docs: add project restart checkpoint`
- Production health verified after premium deploy: `database=supabase`, `vercel=true`
- Latest production alias: `https://ecossistemawhats.vercel.app`

## Done

- Dashboard converted to PT-BR app surface.
- Sidebar navigation made functional.
- Settings screen added.
- User/password update API added at `/api/settings/auth`.
- Premium integrations plan documented in `docs/PREMIUM_INTEGRATIONS_PLAN.md`.
- Premium integrations screen implemented in the `Automacoes` tab.
- Integration API routes added:
  - `GET /api/integrations`
  - `POST /api/integrations`
  - `PATCH /api/integrations/[id]`
  - `POST /api/integrations/[id]/test`
- Supabase schema expanded with:
  - `ecosystem_integrations`
  - `ecosystem_integration_logs`
- Production deploy completed.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed.
- `curl https://ecossistemawhats.vercel.app/api/health`: `{"ok":true,"service":"ecossistemawhats","database":"supabase","vercel":true}`.
- `curl https://ecossistemawhats.vercel.app/api/integrations`: returns fallback integration data with `degraded=true` until the Supabase schema is applied.

## Current Gap

The production Supabase database does not yet have `public.ecosystem_integrations` and `public.ecosystem_integration_logs`.
Apply the updated `SUPABASE_SCHEMA.sql` in Supabase SQL editor or via authenticated Supabase MCP/CLI to activate real persistence for the premium integrations screen.

## Token-Saving Operating Mode

- Use `caveman` at `ultra`.
- Use `terminal-output-compressor` before consuming logs over 80 lines.
- Do not paste raw build/test/deploy/CI logs unless explicitly requested.
- Use:

```powershell
node C:\Users\Cliente\.codex\skills\terminal-output-compressor\scripts\crush-log.js --tier tiny --graph
```

## Skills / Agents To Use

- `caveman`
- `terminal-output-compressor`
- `medical-app-ui`
- `build-web-apps:frontend-app-builder`
- `superpowers:verification-before-completion`
- `superpowers:systematic-debugging`
- GitHub plugin/CLI

## Next Microtasks

1. Apply updated `SUPABASE_SCHEMA.sql` to production Supabase.
2. Re-test `GET /api/integrations` and confirm `degraded=false`.
3. Test `Adicionar`, `Configurar`, `Testar`, `Ver logs` against real Supabase tables.
4. Copy latest repo state to Desktop backup.

## Constraints

- No purchases without explicit approval.
- Work only on `ecossistemawhats`.
