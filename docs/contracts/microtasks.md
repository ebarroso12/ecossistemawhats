# Contrato de Microtarefas

Microtarefa e a menor unidade executavel por agente OpenClaw. Toda entrada por WhatsApp, Telegram, webhook ou dashboard deve virar uma ou mais microtarefas antes de qualquer acao externa.

## Campos

- `agent_key`: agente responsavel, ex: `secretario-clinica`, `estoque-injetaveis`, `crm-pacientes`.
- `channel`: `whatsapp`, `telegram`, `dashboard` ou `openclaw`.
- `title`: acao curta.
- `objective`: resultado concreto.
- `checklist`: passos verificaveis.
- `status`: `queued`, `doing`, `blocked`, `done` ou `failed`.
- `priority`: `critical`, `high`, `normal` ou `low`.
- `input_contract`: dados minimos exigidos.
- `output_contract`: formato da resposta.
- `evidence`: comprovantes, IDs, logs, prints ou links.

## Regras

1. Nunca executar tarefa ambigua sem transformar em checklist.
2. Toda mensagem externa para paciente exige contato validado.
3. Toda acao que envia mensagem, altera financeiro, muda protocolo ou cria cobranca exige `approval_required`.
4. Falha vira evento e microtarefa de reparo.
5. Toda conclusao precisa evidencia minima: timestamp, canal, agente e resultado.

## Padrao de Saida

```json
{
  "status": "done",
  "summary": "Estoque conferido e 3 itens criticos encontrados.",
  "next_actions": ["Aprovar compra de B12", "Confirmar entrega de botox"],
  "needs_approval": true,
  "evidence": {
    "source": "supabase",
    "event_id": "uuid",
    "created_at": "2026-05-24T20:00:00Z"
  }
}
```

## Fila Inicial

- `secretario-clinica`: resumo diario, agenda, pendencias, aniversarios, pacientes sem retorno.
- `estoque-injetaveis`: saldo minimo, vencimentos, compras, itens sem lancamento.
- `crm-pacientes`: leads, retornos, aniversarios, protocolos em aberto.
- `financeiro-clinica`: entradas, saidas, atrasos, previsao de caixa.
- `fireflies-memoria`: reunioes, decisoes, tarefas e memorias permanentes.
- `openclaw-router`: quebra pedidos livres em microtarefas e escolhe agente.
