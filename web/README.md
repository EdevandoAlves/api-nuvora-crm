# Nuvora CRM — web

Aplicativo React + TypeScript + Vite do CRM, usando a direção **Briefing** (Precision UI compacta).

## Rodar

Com a API Nest rodando em `http://127.0.0.1:3000`:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. O Vite faz proxy de `/api` para a API local (veja `vite.config.ts`). Em outro ambiente, defina `VITE_API_URL` com a URL pública da API.

Use uma conta existente ou crie uma organização em `/register`.

## Rotas

- `/login` e `/register` — autenticação.
- `/dashboard` — resumo operacional com caixa, pipeline, tarefas e atividade.
- `/clientes` e `/clientes/:id` — carteira, cadastro, contatos, interações e histórico.
- `/negocios` — pipeline kanban/tabela, criação, edição, estágio e itens.
- `/tarefas` — filtros, criação, edição, conclusão e atraso.
- `/contatos` — diretório global de contatos.
- `/produtos` — catálogo com escrita restrita a Owner/Admin/Manager.
- `/equipe` — usuários, papéis e ativação; gestão restrita a Owner/Admin.

## Scripts

```bash
npm run build
npm run lint
npm run preview
```

## Propostas

As propostas A (Console) e C (Atlas) continuam em `src/proposals/` apenas como referência de direção visual. O app usa a proposta B.
