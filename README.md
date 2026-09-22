# API CRM Nuvora

API REST demonstrativa de um CRM comercial, criada para portfólio com foco em modelagem de domínio, autenticação, isolamento por organização e uma base preparada para evoluir regras de negócio. Não é apresentada como um CRM SaaS completo.

> **Status atual:** a API expõe rotas de autenticação, perfil, clientes e negociações. Tarefas, interações e dashboard permanecem apenas como entidades/modelos no banco, sem rotas publicadas.

## Propósito

O projeto demonstra uma API para iniciar o uso de um CRM por meio do cadastro de uma organização e de seu usuário proprietário, autenticar esse usuário com JWT, gerenciar clientes e acompanhar o ciclo de vida de negociações dentro de cada organização.

## Arquitetura e stack

- **Node.js + TypeScript** com **NestJS 11**;
- adaptador HTTP **Fastify**;
- **PostgreSQL** com **TypeORM** e migrations versionadas;
- configuração por ambiente com `@nestjs/config` e `dotenv`;
- validação global de DTOs com `class-validator` e `class-transformer`;
- autenticação por **JWT** assinado com `jsonwebtoken`, registrada como `APP_GUARD` global em `AppModule`;
- hash de senha com **bcrypt**;
- recuperação de senha por e-mail via `@nestjs-modules/mailer` e Nodemailer;
- documentação interativa com **Swagger**;
- limitação global de requisições com `@nestjs/throttler`.

A aplicação é organizada em módulos Nest. `AppModule` carrega configuração, conexão TypeORM, limitação global de requisições, guard JWT e os módulos de domínio. As entidades TypeORM modelam o domínio e as migrations mantêm o esquema do banco fora do ciclo de inicialização da aplicação (`synchronize: false`).

## Funcionalidades atuais

### Autenticação e perfil

- Cadastro de organização e primeiro usuário, criado com o papel `OWNER`.
- Validação dos dados de entrada, normalização do e-mail no cadastro e prevenção de duplicidade por e-mail, CNPJ ou slug da organização.
- Login com JWT de validade de um dia; usuários e organizações inativos não autenticam.
- Login retorna um objeto `{ accessToken }` no corpo da resposta.
- Solicitação de recuperação de senha com resposta genérica e token aleatório armazenado como hash, válido por uma hora.
- Redefinição de senha com invalidação do token após o uso.
- Rota de perfil protegida por JWT registrada em `GET /users/me`.

### Clientes

- CRUD completo de clientes por organização: criar, listar, buscar por id, atualizar e remover.
- Cada cliente pertence à organização do usuário autenticado e ao seu `owner` por padrão.
- Filtro automático por `organizationId` no service, impedindo leitura de clientes de outras organizações.

### Negociações (deals)

- `POST /deals` cria uma negociação vinculada a um cliente da mesma organização.
- `GET /deals` lista negociações com paginação, filtros (`stage`, `customerId`, `ownerId`, intervalo de datas) e ordenação (`sortBy` e `sortOrder`).
- Resposta paginada segue o formato `{ data: DealResponseDto[], meta: { page, limit, total, totalPages } }`.

### Guard global

- `JwtAuthGuard` é registrado uma única vez como `APP_GUARD` em `AppModule`, aplicando autenticação a todas as rotas, exceto as marcadas com `@Public()` (cadastro, login, recuperação e redefinição de senha).

### Coleção HTTP

- O diretório `http/` traz scripts HTTPie e payloads JSON para testar os endpoints manualmente.
- Os scripts usam caminho relativo corrigido via `cd "$(dirname "$0")"`, garantindo execução a partir de qualquer pasta.
- O subdiretório `http/payloads/secrets/` é ignorado pelo Git e guarda credenciais reais fora do repositório.

## Estrutura do projeto

```text
api-nuvora-crm/
├── http/                  # Coleção HTTPie (scripts + payloads JSON)
├── src/
│   ├── auth/              # Cadastro, login e recuperação de senha
│   │   ├── dto/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   └── auth.service.ts
│   ├── common/
│   │   ├── decorators/    # Decorador para rotas públicas
│   │   ├── guards/        # JwtAuthGuard
│   │   └── utils/         # Geração de slug
│   ├── customers/         # CRUD de clientes
│   ├── deals/             # Negociações (paginação e filtros)
│   ├── entity/            # Entidades TypeORM do domínio CRM
│   ├── migration/         # Migrations TypeORM
│   ├── users/             # Endpoint de perfil
│   ├── app.module.ts      # Composição de módulos e APP_GUARD
│   ├── data-source.ts     # Data source usado pelas migrations
│   └── main.ts            # Bootstrap Fastify, validação e Swagger
├── .env-example
├── package.json
└── tsconfig.json
```

## Pré-requisitos

- Node.js e npm (o repositório não fixa uma versão de Node em `package.json`);
- uma instância acessível de PostgreSQL;
- credenciais SMTP válidas para inicializar o módulo de e-mail, inclusive quando a recuperação de senha não for usada no momento.

## Configuração de ambiente

1. Crie seu arquivo local a partir do modelo:

   ```bash
   cp .env-example .env
   ```

2. Preencha as variáveis abaixo com valores locais. Não versione o arquivo `.env`.

| Variável | Uso |
| --- | --- |
| `PORT` | Porta HTTP da API; se ausente, a aplicação usa `3000`. |
| `TYPEORM_HOST` | Host do PostgreSQL. |
| `TYPEORM_PORT` | Porta do PostgreSQL; se ausente, o código usa `5432`. |
| `TYPEORM_USERNAME` | Usuário do banco. |
| `TYPEORM_PASSWORD` | Senha do banco. |
| `TYPEORM_DATABASE` | Nome do banco. |
| `SECRET_KEY` | Chave obrigatória para assinar e validar JWTs. |
| `FRONTEND_URI` | Base usada para montar o link de redefinição de senha. |
| `SMTP_HOST` | Host do servidor SMTP. |
| `SMTP_PORT` | Porta do servidor SMTP. |
| `SMTP_USER` | Usuário de autenticação SMTP. |
| `SMTP_PASS` | Senha de autenticação SMTP. |
| `NODE_ENV` | Quando definido como `production`, desabilita a interface Swagger. |

`SECRET_KEY`, `FRONTEND_URI` e as quatro variáveis SMTP são lidas com `ConfigService.getOrThrow()` nos fluxos correspondentes. Os valores de `TYPEORM_HOST`, `TYPEORM_USERNAME` e `TYPEORM_DATABASE` também são necessários para uma conexão PostgreSQL funcional. O arquivo `.env-example` contém apenas parte dessas chaves; complete o `.env` local sem incluir valores reais nesta documentação.

## Instalação, migrations e execução

Instale as dependências:

```bash
npm install
```

Com o PostgreSQL configurado e as variáveis de ambiente preenchidas, aplique as migrations:

```bash
npm run migration:run
```

Para desfazer a última migration aplicada:

```bash
npm run migration:revert
```

Inicie a API em modo de desenvolvimento com recarregamento:

```bash
npm run start:dev
```

Outros comandos disponíveis:

| Comando | Finalidade |
| --- | --- |
| `npm run start` | Inicia a aplicação Nest sem modo watch. |
| `npm run start:debug` | Inicia com depuração e modo watch. |
| `npm run build` | Compila TypeScript para `dist/`. |
| `npm run start:prod` | Executa `dist/main`; requer build prévio. |
| `npm run format` | Formata arquivos TypeScript de `src/` com Prettier. |
| `npm run lint` | Executa ESLint com correção automática. |

## Swagger

Com a API em execução e `NODE_ENV` diferente de `production`, a documentação Swagger fica em:

```text
http://localhost:<PORT>/api
```

Por exemplo, com a porta padrão: `http://localhost:3000/api`.

A rota `/api` é configurada apenas fora de produção; ela não é exposta quando `NODE_ENV=production`.

## Endpoints registrados atualmente

### Autenticação e perfil

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Não | Cria uma organização e o primeiro usuário proprietário. |
| `POST` | `/auth/login` | Não | Valida credenciais e retorna `{ accessToken }`. |
| `POST` | `/auth/forgot-password` | Não | Solicita recuperação de senha; limitado a 3 requisições por 60 segundos. |
| `POST` | `/auth/reset-password` | Não | Redefine a senha usando um token válido; limitado a 5 requisições por 60 segundos. |
| `GET` | `/users/me` | Bearer JWT | Rota de perfil protegida pela guard global. |

### Clientes

Todas as rotas exigem Bearer JWT, validado pela guard global.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/customers` | Cria um cliente na organização do token. |
| `GET` | `/customers` | Lista os clientes da organização. |
| `GET` | `/customers/:id` | Busca um cliente por id dentro da organização. |
| `PATCH` | `/customers/:id` | Atualiza um cliente da organização. |
| `DELETE` | `/customers/:id` | Remove um cliente da organização. |

### Negociações

Todas as rotas exigem Bearer JWT, validado pela guard global.

| Método | Rota | Descrição |
| --- | --- | --- |
| `POST` | `/deals` | Cria uma negociação vinculada a um cliente da organização. |
| `GET` | `/deals` | Lista negociações com paginação, filtros e ordenação. |
| `GET` | `/deals/:id` | Busca uma negociação por id (stub atual). |
| `PATCH` | `/deals/:id` | Atualiza uma negociação (stub atual). |
| `DELETE` | `/deals/:id` | Remove uma negociação (stub atual). |

`GET /deals` aceita os seguintes query params, todos opcionais:

| Param | Tipo | Descrição |
| --- | --- | --- |
| `page` | number | Página atual; padrão `1`. |
| `limit` | number | Tamanho da página; padrão `10`. |
| `stage` | enum | Estágio da negociação (`QUALIFICATION`, `PROPOSAL`, `NEGOTIATION`, `CLOSED_WON`, `CLOSED_LOST`). |
| `customerId` | uuid | Filtra por cliente. |
| `ownerId` | uuid | Filtra por proprietário. |
| `startDate` | date | Limite inferior de `createdAt` (`YYYY-MM-DD`). |
| `endDate` | date | Limite superior de `createdAt` (`YYYY-MM-DD`). |
| `sortBy` | enum | Campo de ordenação (`value`, `createdAt`, `expectedCloseDate`); padrão `createdAt`. |
| `sortOrder` | enum | Direção (`ASC`, `DESC`); padrão `DESC`. |

### Saúde

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `GET` | `/ping` | Não | Retorna `Pong` como verificação simples de disponibilidade. |

Para chamar rotas protegidas, envie o token retornado por `/auth/login` no cabeçalho:

```http
Authorization: Bearer <token>
```

## Testando com a coleção HTTPie

Com a aplicação em execução, a coleção `http/` permite testar os endpoints sem montar `curl` manualmente.

Exemplo, a partir da raiz do repositório:

```bash
./http/auth/register.sh "minha-senha"
./http/auth/login.sh
./http/customers/create.sh
./http/deals/findAll.sh
```

Variáveis sensíveis (por exemplo, o `userAdmin.json` usado pelo `login.sh`) ficam em `http/payloads/secrets/`, que está ignorado pelo Git. O `register.sh` recebe a senha como primeiro argumento em vez de versioná-la.

A coleção assume que a variável `$BASE` aponta para a API, por exemplo:

```fish
set -gx BASE "http://localhost:3001"
```

## Segurança: práticas presentes e limitações atuais

### Práticas presentes

- Senhas são armazenadas com bcrypt (`12` rounds no cadastro e `10` na redefinição).
- O cadastro valida formato e tamanho de e-mail, senha, nomes, empresa e CNPJ; a senha exige pelo menos oito caracteres.
- O `ValidationPipe` global transforma entradas, remove campos não permitidos e rejeita campos desconhecidos.
- O login devolve a mesma mensagem para credenciais inválidas, usuário inativo e organização inativa.
- Tokens de recuperação são gerados com `crypto.randomBytes`, persistidos como hash SHA-256 e expirados após uma hora; são anulados depois do uso.
- A guard JWT exige o esquema `Authorization: Bearer <token>` e verifica a assinatura com `SECRET_KEY`.
- A guard JWT é aplicada globalmente, exceto nas rotas marcadas com `@Public()`.
- Há limitação global de 60 requisições por 60 segundos, além de limites mais restritos nas rotas de recuperação de senha.
- `.env` e `http/payloads/secrets/` estão ignorados pelo Git.

### Limitações e TODOs verificados

- O arquivo `.env-example` não cobre `SECRET_KEY`, `FRONTEND_URI` e as variáveis SMTP; o ambiente local precisa adicioná-las.
- `GET /deals/:id`, `PATCH /deals/:id` e `DELETE /deals/:id` permanecem como stubs que retornam apenas o id recebido; precisam ser implementados.
- `GET /users/me` continua dependendo da evolução do serviço de usuários.
- A autorização por papel já tem `RolesWithFullAccess` referenciado, mas ainda não restringe clientes ou negociações.
- Tarefas, interações e dashboard existem como entidades, mas não têm controllers nem rotas publicadas.
- Integrações reais com Gmail ou WhatsApp, cobrança, notificações em tempo real, upload de arquivos, automações de marketing e CRM SaaS multi-tenant comercial permanecem fora do escopo inicial.

## Roadmap

Evoluções futuras podem incluir: autorização por papel em clientes e negociações, módulos de tarefas, interações e dashboard com isolamento por organização, DTOs validados em todos os fluxos, seed inicial, suíte de testes automatizados, upload de anexos e integrações externas.
