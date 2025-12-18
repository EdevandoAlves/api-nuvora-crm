# NuvoraCRM

> Backend de CRM SaaS multi-tenant, focado em isolamento de dados, controle de acesso e arquitetura limpa.
> Projeto autoral, desenvolvido para simular desafios reais de um produto B2B.

## 🚧 Em desenvolvimento ativo  
O foco atual é:
- consolidação do RBAC
- isolamento por organização
- fluxos de usuário (Rotas e regras de negocio dos usuarios)

NuvoraCRM é um backend de CRM poderoso, escalável e fácil de usar, projetado para gerenciar organizações, usuários, clientes, negócios e muito mais. Construído com uma pilha de tecnologia moderna, ele fornece uma base robusta para a construção de uma aplicação de CRM completa.

## ✨ Recursos Técnicos

- Multi-tenancy com isolamento por organização em todas as queries
- RBAC com validação de actor vs target em operações sensíveis
- Fluxo de convite de usuários com token de ativação
- Autenticação JWT stateless
- Separação clara entre Controller / Service / Repository
- DTOs semânticos por caso de uso

## 🛠️ Stack de Tecnologia

- **Backend:** [Fastify](https://www.fastify.io/)
- **ORM:** [TypeORM](https://typeorm.io/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Autenticação:** JWT (JSON Web Tokens)

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

### 1. Clone o repositório

```bash
git clone https://github.com/EdevandoAlves/api-nuvora-crm.git
cd nuvoraCrm
```

### 2. Configure as variáveis de ambiente

Crie um arquivo `.env` copiando o arquivo de exemplo:

```bash
cp .env-example .env
```

Agora, edite o arquivo `.env` com suas credenciais do banco de dados. As credenciais padrão para o contêiner Docker são:

```
TYPEORM_CONNECTION=postgres
TYPEORM_HOST=localhost
TYPEORM_PORT=5432
TYPEORM_USERNAME=postgres
TYPEORM_PASSWORD=1234
TYPEORM_DATABASE=nuvora
TYPEORM_ENTITIES=./src/entity/*.ts
TYPEORM_MIGRATIONS=./src/migration/*.ts
```

### 3. Inicie o banco de dados

Use o Docker Compose para iniciar o banco de dados PostgreSQL em segundo plano:

```bash
docker-compose up -d
```

### 4. Instale as dependências

```bash
npm install
```

### 5. Execute as migrações do banco de dados

Aplique o esquema inicial e quaisquer migrações subsequentes ao banco de dados:

```bash
npm run migration:run
```


### 6. Inicie o servidor de desenvolvimento

```bash
npm run dev
```

O servidor será iniciado em `http://localhost:8000`.

## 📜 Endpoints da API

### Autenticação

- `POST /auth/register`: Registre uma nova organização e seu primeiro usuário (proprietário). (Feito!)
- `POST /auth/login`: Faça o login de um usuário e receba um token JWT.

### Organizações

- `GET /organization/settings`: Obtenha as configurações da organização do usuário logado.
- `PUT /organization/upgrade`: Atualize o plano de assinatura da organização.

### Usuários

- `POST /users`: Crie e convide um novo usuário para a organização.
- `GET /users`: Liste os usuários da organização.

### Clientes

- `POST /customers`: Crie um novo cliente.
- `GET /customers`: Liste os clientes (com filtros por status, setor, etc.).
- `PUT /customers/:id`: Atualize os detalhes de um cliente.
- `PUT /customers/:id/transfer`: Transfira a propriedade de um cliente para outro usuário.

### Contatos

- `POST /customers/:customerId/contacts`: Adicione um novo contato a um cliente.
- `GET /customers/:customerId/contacts`: Liste todos os contatos de um cliente.

### Negócios

- `POST /deals`: Crie um novo negócio de vendas.
- `GET /deals/pipeline`: Visualize o pipeline de vendas, agrupado por estágio.
- `PUT /deals/:id/stage`: Atualize o estágio de um negócio.

...e muitos mais, conforme for sendo criados ira ser adicionado aqui.

## 🗃️ Esquema do Banco de Dados

O banco de dados foi projetado para ser escalável e eficiente, com relacionamentos claros entre as entidades.

- **Organization:** A entidade de nível superior, representando uma empresa que usa o CRM.
- **User:** Pertence a uma Organização e tem uma função específica.
- **Customer:** Uma empresa para a qual sua organização está vendendo. Pertence a uma Organização e tem um proprietário (Usuário).
- **Contact:** Uma pessoa que trabalha em um Cliente.
- **Interaction:** Um registro de uma comunicação ou atividade com um Cliente (por exemplo, chamada, e-mail, reunião).
- **Deal:** Uma venda em potencial, com um valor, estágio e data de fechamento esperada.
- **Task:** Um item de ação para um Usuário concluir.
- **Product:** Um item em seu catálogo de produtos.
- **DealProduct:** Uma tabela de junção que vincula Produtos a Negócios, incluindo quantidade e preço para esse negócio específico.
