# Runbook Diario do Segundo Cerebro

Objetivo: o ecossistema agir como secretario operacional e braco direito do Dr. Edson sem alterar estrutura dos apps existentes.

## 07:30 - Abertura

1. Rodar `/hoje`.
2. Agente `secretario-clinica` consulta eventos, tarefas, contatos e microtarefas.
3. Resposta obrigatoria:
   - agenda do dia;
   - pacientes sem retorno;
   - aniversarios;
   - protocolos pendentes;
   - estoque critico;
   - alertas financeiros;
   - decisoes que precisam aprovacao.

## Durante o Dia

1. Todo webhook vira evento.
2. Todo evento relevante vira microtarefa.
3. Microtarefa critica envia alerta WhatsApp para `+5516992943215`.
4. Microtarefa bloqueada cria tarefa de desbloqueio.
5. Agente nunca apaga dado; apenas acrescenta evento, nota, tarefa ou evidencia.

## 18:00 - Fechamento

1. Rodar `/status`.
2. Conferir filas abertas.
3. Enviar resumo:
   - feito;
   - nao feito;
   - bloqueado;
   - risco para amanha;
   - aprovacao pendente.

## Matriz de Agentes

| Agente | Dono | Entrada | Saida |
| --- | --- | --- | --- |
| `openclaw-router` | Operacao | WhatsApp, Telegram, webhook | Microtarefas e roteamento |
| `secretario-clinica` | Secretaria | Agenda, pacientes, mensagens | Resumo e alertas |
| `estoque-injetaveis` | Estoque | Inventario, vendas, lancamentos | Falta, vencimento, compra |
| `crm-pacientes` | CRM | Leads, formularios, retorno | Contato, follow-up, tarefa |
| `financeiro-clinica` | Financeiro | Receitas, despesas, protocolos | Alertas e pendencias |
| `fireflies-memoria` | Memoria | Reunioes e transcricoes | Decisoes e tarefas |

## Criterios de Pronto

- Evento salvo.
- Microtarefa criada.
- Agente atribuido.
- Saida no formato do contrato.
- Evidencia anexada.
- Mensagem enviada ao canal correto quando necessario.
