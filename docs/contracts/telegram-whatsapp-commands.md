# Comandos WhatsApp e Telegram

Todos os comandos entram no hub, passam por autenticacao de numero/chat permitido, viram evento, depois microtarefa.

## Comandos Base

| Comando | Canal | Permissao | Agente | Resposta |
| --- | --- | --- | --- | --- |
| `/hoje` | WhatsApp/Telegram | read | `secretario-clinica` | Agenda, riscos, pendencias, aniversarios e acoes |
| `/estoque` | WhatsApp/Telegram | read | `estoque-injetaveis` | Itens criticos, vencimentos e reposicao |
| `/pacientes` | WhatsApp/Telegram | read | `crm-pacientes` | Pacientes sem retorno, aniversarios, protocolos |
| `/financeiro` | WhatsApp/Telegram | read | `financeiro-clinica` | Entradas, saidas, pendencias e alertas |
| `/tarefas` | WhatsApp/Telegram | read | `openclaw-router` | Fila por prioridade e agente |
| `/delegar texto` | WhatsApp/Telegram | approval_required | `openclaw-router` | Plano quebrado em microtarefas |
| `/enviar telefone texto` | WhatsApp | approval_required | `secretario-clinica` | Envio com regra da janela WhatsApp |
| `/status` | Telegram | read | `openclaw-router` | Saude: Vercel, Supabase, OpenClaw, webhooks |
| `/resumir periodo` | WhatsApp/Telegram | read | `fireflies-memoria` | Resumo de reunioes, decisoes e tarefas |

## Politica de Aprovacao

- `read`: pode responder dados internos ao numero/chat autorizado.
- `write`: pode criar evento, tarefa, contato ou anotacao.
- `approval_required`: prepara acao e pede confirmacao explicita.
- `admin`: altera integracoes, tokens, schema, env ou deploy.

## Fluxo

1. Recebe comando.
2. Valida origem em `WHATSAPP_ALLOWED_NUMBERS` ou `TELEGRAM_ALLOWED_CHAT_IDS`.
3. Normaliza payload para `ecosystem_events`.
4. Cria `ecosystem_microtasks`.
5. Executa agente.
6. Salva evidencia.
7. Responde no mesmo canal.
8. Envia alerta para `+5516992943215` quando houver falha, estoque critico, aniversario importante, paciente pendente ou decisao que precisa aprovacao.
