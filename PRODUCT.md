# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite. The user confirmed React and TypeScript; Vite is the implementation choice for a client-side SPA talking to the existing Nest API.

## Users

Times comerciais de PMEs usando o CRM Nuvora: OWNER/ADMIN gerenciam organização, equipe e catálogo; MANAGER acompanha a operação e o pipeline; SALES/SUPPORT executam clientes, contatos, interações, tarefas e negociações. O uso principal é em desktop, com revisão diária de pipeline, triagem de tarefas e follow-up de clientes. Tablet é suportado; mobile é secundário.

## Product Purpose

Transformar os dados operacionais do CRM em uma visão diária acionável: o que está no pipeline, o que precisa de atenção hoje, como está a saúde da carteira e o que foi ganho ou perdido. O sucesso é reduzir o tempo entre perceber um problema e agir sobre ele.

## Positioning

Uma interface de operação comercial densa e keyboard-first, que trata o banco de dados do CRM como a fonte da narrativa: cliente → contato → interação → tarefa → negócio → produto → resultado. Não é um dashboard de vaidade; é uma mesa de trabalho.

## Operating Context

- Revisão matinal do pipeline e das tarefas do dia.
- Follow-up de clientes e contatos com histórico de interações.
- Atualização de estágio de negociações e itens/produtos.
- Gestão de equipe e permissões por papel.
- Desktop 1280–1600px como alvo principal; tablet 768–1024px com ações essenciais.
- Idioma pt-BR, moeda BRL e datas dd/mm.

## Capabilities and Constraints

- Autenticação JWT, organização, papéis OWNER/ADMIN/MANAGER/SALES/SUPPORT.
- CRUD de clientes, contatos, interações, tarefas, negociações, produtos e itens de negociação.
- Dashboard com carteira, pipeline, ganho/perda, tarefas e interações.
- Gestão de equipe com `maxUsers`; upgrade de plano/billing ainda não existe.
- Sem anexos, notificações em tempo real ou integrações externas nesta fase.
- A API existente é a fonte de verdade; o frontend não deve inventar contratos.

## Brand Commitments

- Nome: Nuvora.
- Identidade visual criada do zero.
- Direção: Precision UI compacta, ferramenta de trabalho, não dashboard de vitrine.
- Tipografia: IBM Plex Sans + IBM Plex Mono.
- Acento âmbar/Nectar sobre cinza frio; verde/vermelho/âmbar/slate para status.
- Bordas de 1px, raio 4px, sem sombras; ícones outline 1.5px.
- Light/dark com preferência do sistema; densidade compacta com toggle confortável.

## Evidence on Hand

- API Nest com rotas reais e testes E2E.
- Sem dados de produção, clientes reais, depoimentos ou métricas auditadas. As propostas usam dados mockados e não devem ser tratadas como prova.

## Product Principles

1. Densidade com legibilidade: mais informação por tela, sem virar planilha ilegível.
2. Teclado primeiro: command palette, foco visível e ações previsíveis.
3. Uma fonte de verdade por fluxo: cada ação tem um lugar claro.
4. Estado explícito: loading, vazio, erro e sucesso sempre dizem o que aconteceu.
5. Cor com função: âmbar para ação/atenção, verde/vermelho apenas para resultado.

## Accessibility & Inclusion

WCAG AA: contraste 4.5:1 para texto, foco visível, navegação por teclado, alvos de pelo menos 32px em desktop e respeito a `prefers-reduced-motion`.
