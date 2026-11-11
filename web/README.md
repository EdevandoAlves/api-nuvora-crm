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
- `/dashboard` — dashboard Briefing conectado à API.
- `/clientes`, `/negocios`, `/tarefas`, `/contatos`, `/produtos`, `/equipe` — módulos com a API pronta, aguardando a próxima etapa do frontend.

## Scripts

```bash
npm run build
npm run lint
npm run preview
```

## Propostas

As propostas A (Console) e C (Atlas) continuam em `src/proposals/` apenas como referência de direção visual. O app em produção usa a proposta B.
