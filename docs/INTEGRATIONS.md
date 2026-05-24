# Integracoes

## Carta CRM

Objetivo: sincronizar contatos, relacoes e oportunidades.

Entrada recomendada:

- `source=carta`
- `kind=contact_updated`, `deal_created`, `relationship_note`
- `contactName`, `contactPhone`, `summary`, `payload`

## Fireflies

Objetivo: transformar reunioes em memoria e tarefas.

Entrada recomendada:

- `source=fireflies`
- `kind=meeting_summary`
- `summary`: resumo da reuniao
- `payload.decisions`: decisoes
- `payload.tasks`: tarefas detectadas

## WhatsApp Automation

Objetivo: manter comunicacao confiavel.

Regras:

- Telefones sempre em E.164.
- Mensagens livres apenas dentro de 24h desde a ultima mensagem do cliente.
- Fora da janela, usar template aprovado.
- Media precisa estar em HTTPS publico ou ser enviada por upload oficial.

## Webflow Events

Eventos tratados:

- `form_submission`
- `site_publish`
- `page_created`
- `collection_item_created`
- `collection_item_changed`
- `ecomm_new_order`

Seguranca:

- Validar `x-webflow-signature`.
- Usar idempotencia por evento.

## OpenClaw

Objetivo: orquestrar agentes e entregas.

Padrao:

- cada app envia evento para `ecossistemawhats`;
- eventos importantes viram mensagem no hub OpenClaw;
- agentes leem memoria por area e executam tarefas;
- falhas entram como eventos `failed` e tarefas `critical`.
