# Plano Premium de Integracoes

## Objetivo

Criar uma area premium para controlar integracoes do Ecossistema Whats sem depender de compras novas ou servicos pagos sem aprovacao.

## Escopo inicial

1. Ver status Ligado/Desligado por integracao.
2. Adicionar integracao operacional.
3. Configurar dados basicos sem expor secrets no navegador.
4. Testar conectividade de forma segura.
5. Ver logs recentes.
6. Persistir tudo no Supabase.

## Integracoes prioritarias

- WhatsApp / OpenClaw
- Telegram
- Webflow
- Fireflies
- CRM
- Supabase
- Vercel

## Modelo de seguranca

- Service role somente no servidor.
- Browser chama apenas APIs internas do Next.js.
- Configuracoes sensiveis ficam mascaradas no painel.
- Logs guardam status, acao, detalhe e metadata operacional.
- RLS ligada nas tabelas novas.

## Experiencia esperada

Tela premium em formato operacional, com cada integracao exibindo:

- Nome e provedor.
- Status Ligado/Desligado.
- Nivel de saude.
- Ultimo teste.
- Botoes: Configurar, Testar, Ver logs.
- Acao global: Adicionar integracao.

## Fora do escopo agora

- Compra ou ativacao de planos pagos.
- OAuth real de terceiros.
- Sincronizacao profunda com cada fornecedor.
- Secrets reais digitados no frontend.
- Automacao que envie mensagens sem aprovacao.

## Proxima evolucao

Quando a tela premium estiver persistindo no Supabase, adicionar conectores reais um por um, com runbook, teste isolado e fallback.
