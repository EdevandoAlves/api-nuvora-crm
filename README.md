<!-- generated-by: gsd-doc-writer -->
# API CRM Nuvora

API REST demonstrativa de um CRM comercial, criada para portfólio com foco em modelagem de domínio, autenticação e uma base preparada para evoluir regras de negócio por organização. Não é apresentada como um CRM SaaS completo.

> **Status atual:** há cinco endpoints de autenticação/perfil registrados no código. Clientes, negociações, tarefas, interações e dashboard pertencem ao escopo planejado e **não possuem rotas disponíveis nesta versão**.

## Propósito

O projeto demonstra uma API para iniciar o uso de um CRM por meio do cadastro de uma organização e de seu usuário proprietário, autenticar esse usuário com JWT e iniciar o fluxo de recuperação de senha. O escopo de produto completo está descrito em [`crm-api-scope.md`](crm-api-scope.md).

## Arquitetura e stack

- **Node.js + TypeScript** com **NestJS 11**;
- adaptador HTTP **Fastify**;
- **PostgreSQL** com **TypeORM** e migrations versionadas;
- configuração por ambiente com `@nestjs/config` e `dotenv`;
- validação global de DTOs com `class-validator` e `class-transformer`;
- autenticação por **JWT** assinado com `jsonwebtoken`;
- hash de senha com **bcrypt**;
- recuperação de senha por e-mail via `@nestjs-modules/mailer` e Nodemailer;
- documentação interativa com Swagger;
- testes com Jest e Supertest.

A aplicação é organizada em módulos Nest. `AppModule` carrega configuração, conexão TypeORM, limitação global de requisições, autenticação e usuários. As entidades TypeORM modelam o domínio e as migrations mantêm o esquema do banco fora do ciclo de inicialização da aplicação (`synchronize: false`).

## Funcionalidades atuais

### Implementado agora: autenticação e perfil

- Cadastro de organização e primeiro usuário, criado com o papel `OWNER`.
- Validação dos dados de entrada, normalização do e-mail no cadastro e prevenção de duplicidade por e-mail, CNPJ ou slug da organização.
- Login com JWT de validade de um dia; usuários e organizações inativos não autenticam.
- Solicitação de recuperação de senha com resposta genérica e token aleatório armazenado como hash, válido por uma hora.
- Redefinição de senha com invalidação do token após o uso.
- Rota de perfil protegida por JWT registrada em `GET /users/me`.

### Escopo planejado — ainda indisponível

Conforme [`crm-api-scope.md`](crm-api-scope.md), a primeira versão planeja módulos de:

- clientes (`/customers`);
- negociações (`/deals`);
- tarefas e follow-ups (`/tasks`);
- interações (`/interactions`);
- métricas de dashboard (`/dashboard`).

As entidades desses domínios já existem no código, mas isso **não** significa que os endpoints planejados estejam implementados ou publicados.

## Estrutura do projeto

```text
src/
├── auth/                 # Cadastro, login e recuperação de senha
│   ├── dto/              # Contratos e validações de entrada/saída
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   └── auth.service.ts
├── common/
│   ├── decorators/       # Decorador para rotas públicas
│   ├── guards/           # Guarda JWT e ponto de extensão para papéis
│   └── utils/            # Geração de slug
├── entity/               # Entidades TypeORM do domínio CRM
├── migration/            # Migrations TypeORM
├── users/                # Endpoint de perfil
├── app.module.ts         # Composição de módulos e infraestrutura
├── data-source.ts        # Data source usado pelas migrations
└── main.ts               # Bootstrap Fastify, validação e Swagger
test/
└── app.e2e-spec.ts       # Configuração/teste e2e atual
crm-api-scope.md          # Escopo funcional e roadmap do produto
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
| `TYPEORM_CONNECTION` | Indicador de conexão presente no arquivo de exemplo; a conexão da aplicação é configurada como PostgreSQL no código. |
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
| `npm run format` | Formata arquivos TypeScript de `src/` e `test/` com Prettier. |
| `npm run lint` | Executa ESLint com correção automática. |

## Swagger

Com a API em execução e `NODE_ENV` diferente de `production`, a documentação Swagger fica em:

```text
http://localhost:<PORT>/api
```

Por exemplo, com a porta padrão: `http://localhost:3000/api`.

A rota `/api` é configurada apenas fora de produção; ela não é exposta quando `NODE_ENV=production`.

## Endpoints registrados atualmente

| Método | Rota | Autenticação | Descrição |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Não | Cria uma organização e o primeiro usuário proprietário. |
| `POST` | `/auth/login` | Não | Valida credenciais e retorna um JWT como string. |
| `POST` | `/auth/forgot-password` | Não | Solicita recuperação de senha; limitado a 3 requisições por 60 segundos. |
| `POST` | `/auth/reset-password` | Não | Redefine a senha usando um token válido; limitado a 5 requisições por 60 segundos. |
| `GET` | `/users/me` | Bearer JWT | Rota de perfil protegida, registrada no controlador. Veja a limitação conhecida abaixo. |

Também há `GET /ping`, que retorna `Pong` e serve como verificação simples de disponibilidade local.

Para chamar a rota protegida, envie o token retornado por `/auth/login` no cabeçalho:

```http
Authorization: Bearer <token>
```

### Limitação conhecida do perfil

Embora `GET /users/me` esteja registrado e protegido por `JwtAuthGuard`, o serviço atual referencia uma variável `id` que não foi definida. Assim, a rota não retorna um perfil utilizável no estado atual. Ela deve ser concluída antes de ser consumida como endpoint de perfil funcional.

## Segurança: práticas presentes e limitações atuais

### Práticas presentes

- Senhas são armazenadas com bcrypt (`12` rounds no cadastro e `10` na redefinição).
- O cadastro valida formato e tamanho de e-mail, senha, nomes, empresa e CNPJ; a senha exige pelo menos oito caracteres.
- O `ValidationPipe` global transforma entradas, remove campos não permitidos e rejeita campos desconhecidos.
- O login devolve a mesma mensagem para credenciais inválidas, usuário inativo e organização inativa.
- Tokens de recuperação são gerados com `crypto.randomBytes`, persistidos como hash SHA-256 e expirados após uma hora; são anulados depois do uso.
- A guarda JWT exige o esquema `Authorization: Bearer <token>` e verifica a assinatura com `SECRET_KEY`.
- Há limitação global de 60 requisições por 60 segundos, além de limites mais restritos nas rotas de recuperação de senha.
- `.env` está ignorado pelo Git.

### Limitações e TODOs verificados

- A implementação usa `SECRET_KEY`, enquanto o arquivo `.env-example` fornece `JWT_SECRET`; o ambiente local precisa definir `SECRET_KEY` para login e rotas protegidas funcionarem.
- O módulo SMTP exige `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` e `SMTP_PASS`, mas elas não constam no arquivo de exemplo.
- O link de recuperação depende de `FRONTEND_URI`, que também não consta no arquivo de exemplo.
- A autorização por organização e por papel prevista para os módulos CRM ainda não está implementada em rotas de clientes, negociações, tarefas, interações ou dashboard, pois essas rotas ainda não existem.
- `GET /users/me` permanece incompleto, conforme a limitação descrita acima.
- A compilação atual falha em `src/users/users.service.ts` porque `id` é referenciado sem definição. A aplicação precisa dessa correção antes de poder ser compilada e executada a partir do código-fonte.
- A suíte unitária atual falha ao resolver imports que usam o alias `src/` no Jest; não há `moduleNameMapper` correspondente na configuração de Jest de `package.json`.
- Os testes atuais são estruturais e não cobrem os fluxos completos de autenticação ou integração com banco/e-mail.

## Testes

```bash
# suíte unitária
npm run test

# modo watch
npm run test:watch

# cobertura
npm run test:cov

# depuração em execução serial
npm run test:debug

# suíte e2e configurada em test/jest-e2e.json
npm run test:e2e
```

No estado atual do repositório, `npm run test` não conclui devido à resolução dos aliases `src/` no Jest, e `npm run build` falha pela referência indefinida a `id` no serviço de usuários. Os comandos acima são os scripts existentes em `package.json`; as limitações estão registradas para evitar que sejam interpretados como validações bem-sucedidas.

## Roadmap

O roadmap funcional é mantido em [`crm-api-scope.md`](crm-api-scope.md). A evolução planejada inclui 28 rotas em seis módulos: autenticação, clientes, negociações, tarefas, interações e dashboard. Os requisitos transversais previstos incluem isolamento por organização, autorização baseada em papel, DTOs validados, erros consistentes, Swagger, testes relevantes, migrations, seed e execução local com PostgreSQL.

Itens explicitamente fora do escopo inicial incluem integrações reais com Gmail ou WhatsApp, cobrança, notificações em tempo real, upload de arquivos, automações de marketing e CRM SaaS multi-tenant comercial completo.
