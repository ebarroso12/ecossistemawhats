# Arquitetura do Segundo Cerebro

Este projeto e o painel Vercel do ecossistema Dr. Edson Barroso.

## Principio

Nada entra solto. Todo sinal vira:

- contato;
- evento;
- tarefa;
- mensagem;
- memoria operacional.

## Camadas

1. **Entrada**
   - Webflow form/publish/ecommerce via `/api/webhooks/webflow`.
   - OpenClaw e apps internos via `/api/webhooks/[source]`.
   - Fireflies via webhook/API futura.
   - Carta CRM via sincronizacao futura.

2. **Normalizacao**
   - `normalizeEvent()` converte payloads diferentes em um formato unico.
   - `external_id` garante idempotencia quando provedores reenviam eventos.

3. **Banco**
   - Supabase Postgres.
   - RLS ativo.
   - Service-role usado apenas em rotas server-side.
   - Indices para timeline, status, contatos recentes e busca em JSONB.

4. **Acao**
   - `/api/messages/send` envia ao OpenClaw Ecosystem Hub.
   - OpenClaw entrega no WhatsApp.
   - Tarefas ficam no Supabase para execucao humana ou por agentes.

5. **Dashboard**
   - Visao executiva.
   - Linha do tempo.
   - Conversa/contato selecionado.
   - Tarefas abertas.
   - Saude dos fluxos.

## Contrato de Evento

```json
{
  "id": "provider-event-id",
  "kind": "form_submission",
  "title": "Novo formulario",
  "contactName": "Nome",
  "contactPhone": "+5516992943215",
  "summary": "Resumo operacional",
  "priority": "normal",
  "payload": {}
}
```

## Mapa OpenClaw Workspace

- `ecosystem_events`: memoria episodica.
- `ecosystem_contacts`: memoria semantica.
- `ecosystem_tasks`: memoria procedural.
- `ecosystem_messages`: historico de canais.

Esse mapeamento segue a estrutura OpenClaw: agentes separados por area, memoria compartilhada e logs operacionais.
