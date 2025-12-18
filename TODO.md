
# CRM Features TO DO List

---

## 📍 FASE 1 - MVP (Mínimo Viável Produto)

### 🔐 Authentication & Authorization

#### User Registration
- [x] **POST /auth/register**
  - **História**: Como um **novo usuário**, quero **me registrar no CRM** para que **eu possa criar minha organização e começar a usar o sistema**.
  - **Aceita**: `{ email, password, firstName, lastName, companyName, cnpj }`
  - **Cria**: Organization + primeiro User (OWNER)
  - **Retorna**: dados do usuário

#### User Login
- [x] **POST /auth/login**
  - **História**: Como um **usuário registrado**, quero **fazer login** para que **eu possa acessar minha conta e dados**.
  - **Aceita**: `{ email, password }`
  - **Valida**: credenciais, usuário ativo, organização ativa
  - **Retorna**: JWT token (com userId, organizationId, role)

#### Refresh Toke
- [ ] **POST /auth/refresh**
  - **História**: Como um **usuário logado**, quero **renovar meu token automaticamente** para que **eu não precise fazer login toda hora**.
  - **Aceita**: `{ refreshToken }`
  - **Retorna**: Novo accessToken

#### Forgot Password
- [x] **POST /auth/forgot-password**
  - **História**: Como um **usuário que esqueceu a senha**, quero **receber um email de recuperação** para que **eu possa criar uma nova senha**.
  - **Aceita**: `{ email }`
  - **Envia**: Email com token de reset (válido por 1h)

#### Reset Password
- [x] **POST /auth/reset-password**
  - **História**: Como um **usuário que esqueceu a senha**, quero **usar o token recebido por email** para que **eu possa definir uma nova senha**.
  - **Aceita**: `{ token, newPassword }`
  - **Valida**: Token não expirado
  - **Atualiza**: Password do usuário

#### Logout
- [ ] **POST /auth/logout**
  - **História**: Como um **usuário logado**, quero **fazer logout** para que **minha sessão seja encerrada com segurança**.
  - **Invalida**: Refresh token atual

---

### 👥 User Management

#### Invite User
- [x] **POST /users/invite**
  - **História**: Como um **OWNER ou ADMIN**, quero **convidar novos usuários para minha organização** para que **minha equipe possa usar o CRM**.
  - **Requer**: Role OWNER ou ADMIN
  - **Aceita**: `{ email, firstName, lastName, role }`
  - **Valida**: Limite de usuários do plano não excedido
  - **Envia**: Email com link de convite (token válido por 7 dias)

#### Accept Invitation
- [ ] **POST /auth/accept-invitation**
  - **História**: Como um **usuário convidado**, quero **aceitar o convite e definir minha senha** para que **eu possa começar a usar o CRM**.
  - **Aceita**: `{ token, password }`
  - **Valida**: Token não expirado
  - **Ativa**: Usuário e permite login

#### List Users
- [ ] **GET /users**
  - **História**: Como um **MANAGER ou ADMIN**, quero **ver todos os usuários da minha organização** para que **eu possa gerenciar minha equipe**.
  - **Requer**: Role MANAGER, ADMIN ou OWNER
  - **Filtra**: `WHERE organizationId = user.organizationId`
  - **Query params**: `?role=SALES&isActive=true`
  - **Retorna**: Lista de usuários com contagem de customers/deals

#### Get User Details
- [ ] **GET /users/:id**
  - **História**: Como um **MANAGER**, quero **ver detalhes de um usuário** para que **eu possa avaliar sua performance**.
  - **Requer**: Usuário da mesma organization
  - **Retorna**: Dados completos + estatísticas (customers, deals, tasks)

#### Update User Profile
- [x] **PUT /users/:id**
  - **História**: Como um **usuário**, quero **atualizar meu perfil** para que **minhas informações estejam sempre corretas**.
  - **Permissão**: Próprio usuário OU ADMIN/OWNER
  - **Aceita**: `{ firstName, lastName, avatar, phone }`
  - **NÃO permite**: Mudar email, role, organizationId

#### Change Password
- [ ] **PUT /users/:id/password**
  - **História**: Como um **usuário**, quero **trocar minha senha** para que **eu mantenha minha conta segura**.
  - **Permissão**: Apenas o próprio usuário
  - **Aceita**: `{ currentPassword, newPassword }`
  - **Valida**: currentPassword está correta

#### Deactivate User
- [ ] **PUT /users/:id/deactivate**
  - **História**: Como um **OWNER ou ADMIN**, quero **desativar um usuário** para que **ele não possa mais acessar o sistema** (ex: funcionário demitido).
  - **Requer**: Role OWNER ou ADMIN
  - **Atualiza**: `isActive = false`
  - **Mantém**: Todos os dados históricos (customers, interactions)

#### Reactivate User
- [ ] **PUT /users/:id/reactivate**
  - **História**: Como um **OWNER**, quero **reativar um usuário desativado** para que **ele volte a ter acesso** (ex: retorno de férias).
  - **Requer**: Role OWNER
  - **Atualiza**: `isActive = true`

---

### 🏢 Customer Management

#### Create Customer
- [ ] **POST /customers**
  - **História**: Como um **vendedor**, quero **cadastrar um novo cliente** para que **eu possa começar a registrar interações e criar oportunidades**.
  - **Requer**: Role SALES ou superior
  - **Aceita**: `{ companyName, cnpj, industry, website, status, source, address }`
  - **Define**: `ownerId = userId` (quem criou é o dono)
  - **Define**: `organizationId = user.organizationId`

#### List Customers
- [ ] **GET /customers**
  - **História**: Como um **vendedor**, quero **ver minha lista de clientes** para que **eu possa acompanhar minha carteira**.
  - **Filtros por Role**:
    - SALES: `WHERE ownerId = userId`
    - MANAGER/ADMIN/OWNER: `WHERE organizationId = user.organizationId`
  - **Query params**: `?status=PROSPECT&industry=Tecnologia&page=1&limit=20`
  - **Retorna**: Lista paginada com contagem de deals, última interação

#### Search Customers
- [ ] **GET /customers/search**
  - **História**: Como um **usuário**, quero **buscar clientes rapidamente** para que **eu encontre informações sem ter que navegar por listas longas**.
  - **Query params**: `?q=Magazine`
  - **Busca em**: companyName, cnpj, website
  - **Retorna**: Resultados ordenados por relevância

#### Get Customer Details
- [ ] **GET /customers/:id**
  - **História**: Como um **vendedor**, quero **ver todos os detalhes de um cliente** para que **eu tenha contexto completo antes de interagir**.
  - **Valida**: Customer pertence à organization do usuário
  - **Se SALES**: Valida que é o owner
  - **Retorna**: Dados completos + estatísticas (deals, contacts, interactions)

#### Update Customer
- [ ] **PUT /customers/:id**
  - **História**: Como um **vendedor**, quero **atualizar informações do cliente** para que **os dados estejam sempre corretos**.
  - **Valida**: Permissão (owner OU MANAGER+)
  - **Aceita**: Qualquer campo exceto `id`, `organizationId`, `ownerId`
  - **Atualiza**: `updatedAt = now()`

#### Transfer Customer Ownership
- [ ] **PUT /customers/:id/transfer**
  - **História**: Como um **MANAGER**, quero **transferir um cliente de um vendedor para outro** para que **eu possa redistribuir a carteira** (ex: funcionário saiu).
  - **Requer**: Role MANAGER ou superior
  - **Aceita**: `{ newOwnerId }`
  - **Valida**: newOwner pertence à mesma organization
  - **Cria**: Interaction automática registrando a transferência

#### Soft Delete Customer
- [ ] **DELETE /customers/:id**
  - **História**: Como um **vendedor**, quero **remover um cliente** para que **ele não apareça mais nas minhas listas** (mas mantendo histórico).
  - **Valida**: Permissão (owner OU ADMIN+)
  - **Atualiza**: `deletedAt = now()`
  - **NÃO apaga**: Dados físicos (soft delete)

#### Customer Statistics
- [ ] **GET /customers/stats**
  - **História**: Como um **MANAGER**, quero **ver estatísticas da carteira** para que **eu possa tomar decisões baseadas em dados**.
  - **Filtra**: Por role (SALES vê só seus, MANAGER vê todos)
  - **Retorna**: 
    ```json
    {
      "total": 150,
      "byStatus": { "LEAD": 50, "PROSPECT": 60, "CUSTOMER": 40 },
      "byIndustry": { "Tecnologia": 30, "Varejo": 50 },
      "newThisMonth": 15,
      "conversionRate": 35.5
    }
    ```

---

### 👔 Contact Management

#### Create Contact
- [ ] **POST /customers/:customerId/contacts**
  - **História**: Como um **vendedor**, quero **adicionar contatos individuais em uma empresa** para que **eu saiba com quem falar em cada situação**.
  - **Valida**: Customer pertence à organization do usuário
  - **Aceita**: `{ firstName, lastName, email, phone, position, isPrimary, linkedin }`
  - **Se isPrimary=true**: Remove isPrimary dos outros contacts

#### List Customer Contacts
- [ ] **GET /customers/:customerId/contacts**
  - **História**: Como um **vendedor**, quero **ver todos os contatos de um cliente** para que **eu escolha com quem interagir**.
  - **Ordena**: isPrimary DESC, firstName ASC
  - **Retorna**: Lista com última interação de cada contact

#### Get Contact Details
- [ ] **GET /contacts/:id**
  - **História**: Como um **vendedor**, quero **ver detalhes de um contato** para que **eu tenha contexto antes de ligar/escrever**.
  - **Valida**: Contact pertence à organization do usuário
  - **Retorna**: Dados + histórico de interações com esse contact

#### Update Contact
- [ ] **PUT /contacts/:id**
  - **História**: Como um **vendedor**, quero **atualizar dados de um contato** para que **as informações estejam sempre corretas**.
  - **Aceita**: Qualquer campo exceto `id`, `customerId`, `organizationId`

#### Set Primary Contact
- [ ] **PUT /contacts/:id/set-primary**
  - **História**: Como um **vendedor**, quero **definir o contato principal** para que **emails importantes sejam enviados para a pessoa certa**.
  - **Atualiza**: `isPrimary = true` para este, `false` para os outros do mesmo customer

#### Delete Contact
- [ ] **DELETE /contacts/:id**
  - **História**: Como um **vendedor**, quero **remover um contato** para que **contatos inativos não apareçam** (ex: pessoa saiu da empresa).
  - **Hard delete**: Remove fisicamente (contacts não precisam auditoria tão rígida)

---

### 💬 Interaction Logging

#### Create Interaction
- [ ] **POST /interactions**
  - **História**: Como um **vendedor**, quero **registrar todas minhas interações com clientes** para que **eu e minha equipe tenhamos histórico completo**.
  - **Aceita**: `{ customerId, contactId?, type, subject, description, duration?, scheduledAt?, completedAt? }`
  - **Define**: `userId = user.id`, `organizationId = customer.organizationId`
  - **Tipos**: EMAIL, CALL, MEETING, NOTE, WHATSAPP

#### Customer Timeline
- [ ] **GET /customers/:id/timeline**
  - **História**: Como um **vendedor**, quero **ver a timeline completa do cliente** para que **eu entenda todo o histórico antes de interagir**.
  - **Retorna**: Todas interactions ordenadas por data DESC
  - **Inclui**: Dados do user que fez, contact envolvido
  - **Agrupa**: Por data (hoje, ontem, esta semana, etc)

#### List Interactions
- [ ] **GET /interactions**
  - **História**: Como um **MANAGER**, quero **ver todas interações da equipe** para que **eu monitore atividade**.
  - **Filtra por Role**: SALES vê só suas, MANAGER+ vê todas da org
  - **Query params**: `?type=CALL&dateFrom=2025-10-01&dateTo=2025-10-31&userId=xxx`

#### Update Interaction
- [ ] **PUT /interactions/:id**
  - **História**: Como um **vendedor**, quero **corrigir uma interação registrada** para que **o histórico esteja preciso** (ex: errei a duração da call).
  - **Permissão**: Criador OU ADMIN+
  - **Aceita**: `{ subject, description, duration }`

#### Delete Interaction
- [ ] **DELETE /interactions/:id**
  - **História**: Como um **vendedor**, quero **remover uma interação registrada por engano** para que **o histórico não fique poluído**.
  - **Permissão**: Criador OU ADMIN+
  - **Soft delete**: `deletedAt = now()`

---

### 💰 Deal/Opportunity Management

#### Create Deal
- [ ] **POST /deals**
  - **História**: Como um **vendedor**, quero **criar uma oportunidade de venda** para que **eu possa acompanhar o progresso da negociação**.
  - **Aceita**: `{ customerId, title, value, stage, probability, expectedCloseDate }`
  - **Define**: `ownerId = userId`, `organizationId = customer.organizationId`
  - **Stage inicial**: Geralmente QUALIFICATION (ou customizável)

#### List Deals
- [ ] **GET /deals**
  - **História**: Como um **vendedor**, quero **ver minhas oportunidades** para que **eu priorize meu trabalho**.
  - **Filtra por Role**: SALES vê `ownerId = userId`, MANAGER+ vê todos da org
  - **Query params**: `?stage=PROPOSAL&customerId=xxx&page=1`
  - **Retorna**: Lista com dados do customer, valor total de produtos

#### Get Deal Details
- [ ] **GET /deals/:id**
  - **História**: Como um **vendedor**, quero **ver todos os detalhes de um deal** para que **eu tenha contexto completo da negociação**.
  - **Retorna**: Dados completos + produtos + timeline de mudanças de stage

#### Update Deal
- [ ] **PUT /deals/:id**
  - **História**: Como um **vendedor**, quero **atualizar informações do deal** para que **os dados reflitam a situação atual** (ex: cliente pediu desconto, valor mudou).
  - **Permissão**: Owner OU MANAGER+
  - **Aceita**: `{ title, value, probability, expectedCloseDate }`
  - **NÃO permite**: Mudar stage (usa endpoint específico)

#### Update Deal Stage
- [ ] **PUT /deals/:id/stage**
  - **História**: Como um **vendedor**, quero **mover o deal para próxima etapa** para que **o pipeline reflita o progresso real**.
  - **Aceita**: `{ newStage, lostReason? }`
  - **Validações**:
    - Se CLOSED_LOST: Exige `lostReason`
    - Se CLOSED_WON ou CLOSED_LOST: Define `closedAt = now()`
  - **Cria**: Interaction automática "Deal movido para [STAGE]"
  - **Atualiza**: `probability` baseado no stage (mapeamento configurável)

#### View Pipeline
- [ ] **GET /deals/pipeline**
  - **História**: Como um **MANAGER**, quero **visualizar o pipeline de vendas** para que **eu entenda a saúde do funil e preveja receita**.
  - **Filtra por Role**: SALES vê só seus, MANAGER+ vê todos da org
  - **Query params**: `?userId=xxx&period=month`
  - **Retorna**:
    ```json
    {
      "QUALIFICATION": { count: 10, totalValue: 500000, weightedValue: 125000 },
      "PROPOSAL": { count: 5, totalValue: 300000, weightedValue: 150000 },
      "NEGOTIATION": { count: 3, totalValue: 200000, weightedValue: 150000 },
      "totalWeightedRevenue": 425000
    }
    ```

#### Delete Deal
- [ ] **DELETE /deals/:id**
  - **História**: Como um **vendedor**, quero **remover um deal criado por engano** para que **meu pipeline fique limpo**.
  - **Permissão**: Owner OU ADMIN+
  - **Soft delete**: `deletedAt = now()`

---

### ✅ Task Management

#### Create Task
- [ ] **POST /tasks**
  - **História**: Como um **vendedor**, quero **criar lembretes de ações** para que **eu não esqueça de fazer follow-ups**.
  - **Aceita**: `{ customerId, dealId?, title, description, type, priority, dueDate }`
  - **Define**: `userId = user.id` (tarefa para si mesmo)
  - **Status inicial**: PENDING

#### Create Task for Another User
- [ ] **POST /tasks (com userId diferente)**
  - **História**: Como um **MANAGER**, quero **delegar tarefas para vendedores** para que **eu distribua o trabalho da equipe**.
  - **Requer**: Role MANAGER ou superior
  - **Aceita**: `{ userId, customerId, ... }`
  - **Envia**: Notificação para o usuário atribuído

#### List My Tasks
- [ ] **GET /tasks/my**
  - **História**: Como um **vendedor**, quero **ver minhas tarefas pendentes** para que **eu organize meu dia**.
  - **Filtra**: `userId = user.id AND status = PENDING`
  - **Ordena**: priority DESC, dueDate ASC
  - **Agrupa**: Por período (atrasadas, hoje, amanhã, próximos 7 dias, futuras)

#### List Overdue Tasks
- [ ] **GET /tasks/overdue**
  - **História**: Como um **vendedor**, quero **ver tarefas atrasadas** para que **eu priorize o que ficou pendente**.
  - **Filtra**: `userId = user.id AND dueDate < hoje AND status = PENDING`
  - **Ordena**: dueDate ASC (mais antigas primeiro)

#### List All Tasks
- [ ] **GET /tasks**
  - **História**: Como um **MANAGER**, quero **ver tarefas de toda equipe** para que **eu monitore produtividade**.
  - **Requer**: Role MANAGER ou superior
  - **Query params**: `?userId=xxx&status=PENDING&priority=HIGH`

#### Get Task Details
- [ ] **GET /tasks/:id**
  - **História**: Como um **vendedor**, quero **ver detalhes de uma tarefa** para que **eu entenda o contexto completo**.
  - **Retorna**: Dados + customer + deal + histórico de mudanças

#### Update Task
- [ ] **PUT /tasks/:id**
  - **História**: Como um **vendedor**, quero **editar uma tarefa** para que **eu corrija informações** (ex: mudei a data, prioridade).
  - **Permissão**: Atribuído OU MANAGER+
  - **Aceita**: `{ title, description, priority, dueDate }`

#### Mark Task as Complete
- [ ] **PUT /tasks/:id/complete**
  - **História**: Como um **vendedor**, quero **marcar tarefa como concluída** para que **eu acompanhe meu progresso**.
  - **Atualiza**: `status = COMPLETED`, `completedAt = now()`
  - **Cria**: Interaction automática vinculada ao customer (tipo NOTE)

#### Cancel Task
- [ ] **PUT /tasks/:id/cancel**
  - **História**: Como um **vendedor**, quero **cancelar uma tarefa que não faz mais sentido** para que **minha lista fique limpa** (ex: cliente desistiu).
  - **Atualiza**: `status = CANCELLED`

#### Reschedule Task
- [ ] **PUT /tasks/:id/reschedule**
  - **História**: Como um **vendedor**, quero **adiar uma tarefa** para que **eu possa focar no que é urgente hoje**.
  - **Aceita**: `{ newDueDate }`
  - **Atualiza**: `dueDate`

#### Delete Task
- [ ] **DELETE /tasks/:id**
  - **História**: Como um **vendedor**, quero **remover uma tarefa criada por engano** para que **não fique lixo no sistema**.
  - **Permissão**: Atribuído OU ADMIN+
  - **Soft delete**: `deletedAt = now()`

---

### 📦 Product Catalog

#### Create Product
- [ ] **POST /products**
  - **História**: Como um **ADMIN**, quero **cadastrar produtos que vendemos** para que **vendedores possam adicionar em deals**.
  - **Requer**: Role ADMIN ou OWNER
  - **Aceita**: `{ name, description, price, category }`
  - **Define**: `organizationId = user.organizationId`, `isActive = true`

#### List Products
- [ ] **GET /products**
  - **História**: Como um **vendedor**, quero **ver o catálogo de produtos** para que **eu adicione aos deals**.
  - **Filtra**: `WHERE organizationId = user.organizationId AND isActive = true`
  - **Query params**: `?category=Software&search=PRO`

#### Get Product Details
- [ ] **GET /products/:id**
  - **História**: Como um **vendedor**, quero **ver detalhes de um produto** para que **eu saiba o que estou vendendo**.
  - **Retorna**: Dados completos + quantos deals usam esse produto

#### Update Product
- [ ] **PUT /products/:id**
  - **História**: Como um **ADMIN**, quero **atualizar informações do produto** para que **preços e descrições estejam corretos** (ex: reajuste anual).
  - **Requer**: Role ADMIN ou OWNER
  - **Aceita**: `{ name, description, price, category }`

#### Deactivate Product
- [ ] **PUT /products/:id/deactivate**
  - **História**: Como um **ADMIN**, quero **desativar um produto descontinuado** para que **não apareça mais no catálogo**, mas mantendo histórico em deals antigos.
  - **Requer**: Role ADMIN ou OWNER
  - **Atualiza**: `isActive = false`

---

### 🔗 Deal-Product Association

#### Add Product to Deal
- [ ] **POST /deals/:dealId/products**
  - **História**: Como um **vendedor**, quero **adicionar produtos ao deal** para que **o valor seja calculado automaticamente**.
  - **Aceita**: `{ productId, quantity, unitPrice?, discount? }`
  - **Cálculo**: `totalPrice = (unitPrice || product.price) * quantity * (1 - discount/100)`
  - **Atualiza**: `deal.value = soma de todos DealProducts.totalPrice`

#### List Deal Products
- [ ] **GET /deals/:dealId/products**
  - **História**: Como um **vendedor**, quero **ver quais produtos estão no deal** para que **eu confira a proposta antes de enviar**.
  - **Retorna**: Lista com dados completos do produto (JOIN)

#### Update Deal Product
- [ ] **PUT /deal-products/:id**
  - **História**: Como um **vendedor**, quero **ajustar quantidade/desconto de um produto** para que **a proposta reflita a negociação** (ex: cliente pediu desconto).
  - **Aceita**: `{ quantity, unitPrice, discount }`
  - **Recalcula**: `totalPrice`
  - **Atualiza**: `deal.value`

#### Remove Product from Deal
- [ ] **DELETE /deal-products/:id**
  - **História**: Como um **vendedor**, quero **remover um produto do deal** para que **eu ajuste a proposta** (ex: cliente não quer mais esse item).
  - **Hard delete**: Remove fisicamente
  - **Atualiza**: `deal.value = soma dos produtos restantes`

---

### ⚙️ Organization Settings

#### Get Organization Settings
- [ ] **GET /organization/settings**
  - **História**: Como um **OWNER**, quero **ver configurações da minha organização** para que **eu saiba meu plano, limites e dados**.
  - **Requer**: Token JWT válido
  - **Retorna**: Dados da organization do user logado + usage metrics

#### Update Organization Info
- [ ] **PUT /organization/settings**
  - **História**: Como um **OWNER**, quero **atualizar dados da empresa** para que **informações estejam corretas** (ex: mudou razão social, logo).
  - **Requer**: Role OWNER
  - **Aceita**: `{ name, cnpj, logo }`
  - **NÃO permite**: Mudar `plan`, `maxUsers` (usa endpoint específico)

#### Get Usage Metrics
- [ ] **GET /organization/usage**
  - **História**: Como um **OWNER**, quero **ver quanto estou usando do meu plano** para que **eu saiba se preciso fazer upgrade**.
  - **Requer**: Role OWNER
  - **Retorna**:
    ```json
    {
      "plan": "BASIC",
      "limits": { "users": 5, "customers": 500 },
      "usage": { "users": 3, "customers": 187 },
      "percentUsed": { "users": 60, "customers": 37.4 }
    }
    ```

---

### 🔐 Security Middleware (Core da Fase 1)

#### JWT Authentication Middleware
- [ ] **Middleware: verifyToken**
  - **História**: Como **sistema**, quero **validar tokens em toda request** para que **apenas usuários autenticados acessem**.
  - **Verifica**: Token válido, não expirado, usuário existe e está ativo
  - **Adiciona**: `req.user = { id, organizationId, role }`

#### Organization Isolation Middleware
- [ ] **Middleware: checkOrganization**
  - **História**: Como **sistema**, quero **garantir isolamento de dados** para que **Organization A nunca veja dados da Organization B**.
  - **Aplica**: Em TODA rota que acessa recursos (customers, deals, etc)
  - **Valida**: `resource.organizationId === req.user.organizationId`
  - **Retorna 403**: Se violação detectada

#### Role-Based Access Control
- [ ] **Middleware: requireRole([roles])**
  - **História**: Como **sistema**, quero **controlar permissões por role** para que **apenas usuários autorizados façam certas ações**.
  - **Exemplo**: `requireRole(['ADMIN', 'OWNER'])` para criar produtos
  - **Retorna 403**: Se user.role não está na lista

#### Input Validation (DTOs)
- [ ] **Middleware: validateDTO(schema)**
  - **História**: Como **sistema**, quero **validar dados de entrada** para que **não entre lixo no banco** (ex: email inválido, CNPJ errado).
  - **Usa**: DTOS and JSON SCHEMA
  - **Retorna 400**: Com lista de erros de validação

---

## 📊 FASE 2 - Analytics & Reports

### Dashboard & Analytics

#### Dashboard Overview
- [ ] **GET /analytics/dashboard**
  - **História**: Como um **MANAGER**, quero **ver um resumo geral do CRM** para que **eu tenha visão rápida de tudo**.
  - **Retorna**:
    ```json
    {
      "customers": { "total": 150, "newThisMonth": 15, "byStatus": {...} },
      "deals": { "total": 45, "totalValue": 1500000, "wonThisMonth": 5 },
      "tasks": { "pending": 23, "overdue": 5, "completedThisWeek": 18 },
      "revenue": { "closedThisMonth": 350000, "forecast": 500000 }
    }
    ```

#### Pipeline Report
- [ ] **GET /analytics/pipeline**
  - **História**: Como um **MANAGER**, quero **ver o funil de vendas detalhado** para que **eu identifique gargalos**.
  - **Query params**: `?period=quarter&userId=xxx`
  - **Retorna**: Dados por stage + taxa de conversão entre stages

#### Revenue Forecast
- [ ] **GET /analytics/forecast**
  - **História**: Como um **CEO**, quero **prever receita futura** para que **eu planeje investimentos**.
  - **Query params**: `?startDate=2025-11&endDate=2026-01`
  - **Cálculo**: `SUM(deal.value * deal.probability / 100)` agrupado por mês
  - **Retorna**: Receita esperada mês a mês

#### Win/Loss Analysis
- [ ] **GET /analytics/win-loss**
  - **História**: Como um **MANAGER**, quero **entender por que perdemos deals** para que **eu melhore o processo de vendas**.
  - **Query params**: `?period=year&userId=xxx`
  - **Retorna**:
    ```json
    {
      "winRate": 42.5,
      "avgDealSize": { "won": 85000, "lost": 65000 },
      "avgTimeToClose": { "won": 45, "lost": 67 },
      "lostReasons": {
        "Preço alto": 35,
        "Escolheu concorrente": 28,
        "Sem budget": 20
      }
    }
    ```

#### Sales Performance by User
- [ ] **GET /analytics/sales-performance**
  - **História**: Como um **MANAGER**, quero **comparar performance dos vendedores** para que **eu reconheça top performers e ajude quem está atrasado**.
  - **Query params**: `?period=month`
  - **Retorna**:
    ```json
    {
      "users": [
        {
          "user": { "id": "...", "name": "João" },
          "metrics": {
            "dealsCreated": 15,
            "dealsWon": 6,
            "totalRevenue": 250000,
            "winRate": 40,
            "avgDealSize": 41667,
            "activitiesLogged": 87
          }
        }
      ]
    }
    ```

#### Activity Report
- [ ] **GET /analytics/activity**
  - **História**: Como um **MANAGER**, quero **ver atividade da equipe** para que **eu identifique quem está engajado e quem precisa de ajuda**.
  - **Query params**: `?userId=xxx&dateFrom=2025-10-01&dateTo=2025-10-31`
  - **Retorna**:
    ```json
    {
      "totalInteractions": 245,
      "byType": {
        "CALL": 89,
        "EMAIL": 102,
        "MEETING": 34,
        "NOTE": 20
      },
      "byUser": [
        { "user": "João", "count": 87, "avgPerDay": 4.2 },
        { "user": "Maria", "count": 102, "avgPerDay": 4.9 }
      ],
      "trend": "15% maior que mês passado"
    }
    ```

#### Customer Acquisition Report
- [ ] **GET /analytics/customer-acquisition**
  - **História**: Como um **CEO**, quero **ver evolução de clientes** para que **eu acompanhe crescimento**.
  - **Query params**: `?period=year`
  - **Retorna**:
    ```json
    {
      "byMonth": [
        { "month": "2025-10", "newCustomers": 15, "bySource": {...} }
      ],
      "topSources": [
        { "source": "LinkedIn", "count": 45, "conversionRate": 32 },
        { "source": "Indicação", "count": 38, "conversionRate": 51 }
      ]
    }
    ```

#### Task Completion Rate
- [ ] **GET /analytics/task-completion**
  - **História**: Como um **MANAGER**, quero **ver taxa de conclusão de tarefas** para que **eu identifique problemas de produtividade**.
  - **Query params**: `?userId=xxx&period=month`
  - **Retorna**:
    ```json
    {
      "completionRate": 78.5,
      "avgTimeToComplete": 1.8,
      "overdueRate": 12.3,
      "byUser": [
        { "user": "João", "completed": 45, "pending": 12, "rate": 78.9 }
      ]
    }
    ```

---

### 🔍 Global Search

#### Search All Entities
- [ ] **GET /search**
  - **História**: Como um **usuário**, quero **buscar em tudo de uma vez** para que **eu encontre informações rapidamente sem saber onde procurar**.
  - **Query params**: `?q=Magazine&entities=customers,contacts,deals`
  - **Busca em**: Customers (name, cnpj), Contacts (name, email), Deals (title)
  - **Filtra**: Sempre por organizationId
  - **Retorna**:
    ```json
    {
      "query": "Magazine",
      "results": {
        "customers": [{ "id": "...", "name": "Magazine Luiza", "type": "customer" }],
        "contacts": [{ "id": "...", "name": "João Magazine", "type": "contact" }],
        "deals": [{ "id": "...", "title": "Deal Magazine", "type": "deal" }]
      },
      "totalResults": 3
    }
    ```

#### Recent Searches
- [ ] **GET /search/recent**
  - **História**: Como um **usuário**, quero **ver minhas buscas recentes** para que **eu acesse rapidamente o que busquei antes**.
  - **Armazena**: Últimas 10 buscas do usuário (em cache ou tabela)
  - **Retorna**: `["Magazine", "Ambev", "João Silva"]`

---

### 🔔 Notifications

#### List Notifications
- [ ] **GET /notifications**
  - **História**: Como um **usuário**, quero **ver minhas notificações** para que **eu fique informado de eventos importantes**.
  - **Filtra**: `WHERE userId = user.id`
  - **Query params**: `?isRead=false&limit=20`
  - **Ordena**: createdAt DESC
  - **Retorna**: Lista com dados da entidade relacionada (customer, deal, etc)

#### Unread Count
- [ ] **GET /notifications/unread-count**
  - **História**: Como um **usuário**, quero **ver quantas notificações não lidas tenho** para que **eu saiba que há novidades** (badge no ícone).
  - **Retorna**: `{ "count": 5 }`

#### Mark Notification as Read
- [ ] **PUT /notifications/:id/read**
  - **História**: Como um **usuário**, quero **marcar notificação como lida** para que **ela não apareça mais como pendente**.
  - **Atualiza**: `isRead = true`

#### Mark All as Read
- [ ] **PUT /notifications/read-all**
  - **História**: Como um **usuário**, quero **marcar todas como lidas de uma vez** para que **eu limpe a lista rapidamente**.
  - **Atualiza**: `isRead = true WHERE userId = user.id AND isRead = false`

#### Delete Notification
- [ ] **DELETE /notifications/:id**
  - **História**: Como um **usuário**, quero **remover notificações antigas** para que **minha lista fique limpa**.
  - **Hard delete**: Remove fisicamente (notificações não precisam auditoria)

---

### 📎 File Attachments

#### Upload File
- [ ] **POST /attachments**
  - **História**: Como um **vendedor**, quero **anexar arquivos a clientes/deals** para que **eu organize documentos** (propostas, contratos, apresentações).
  - **Aceita**: Multipart form-data com arquivo + metadata
  - **Body**: `{ relatedEntityType: 'CUSTOMER', relatedEntityId: 'xxx', file: <binary> }`
  - **Valida**: Tamanho máximo (ex: 10MB), tipos permitidos (pdf, docx, xlsx, png, jpg)
  - **Upload para**: AWS S3 / Cloudinary / Google Cloud Storage
  - **Salva no banco**: URL, metadata
  - **Retorna**: Dados do attachment criado

#### List Files
- [ ] **GET /attachments**
  - **História**: Como um **vendedor**, quero **ver todos arquivos de um cliente/deal** para que **eu acesse documentos rapidamente**.
  - **Query params**: `?entityType=CUSTOMER&entityId=xxx`
  - **Filtra**: Por organizationId (segurança)
  - **Retorna**: Lista com preview URL, tamanho, uploader

#### Download File
- [ ] **GET /attachments/:id/download**
  - **História**: Como um **usuário**, quero **baixar um arquivo** para que **eu visualize/edite localmente**.
  - **Valida**: Attachment pertence à organization do usuário
  - **Redireciona**: Para URL assinada temporária (S3 pre-signed URL) OU
  - **Stream**: Arquivo direto da resposta HTTP

#### Delete File
- [ ] **DELETE /attachments/:id**
  - **História**: Como um **vendedor**, quero **remover arquivo anexado por engano** para que **não ocupe espaço**.
  - **Permissão**: Uploader OU ADMIN+
  - **Deleta**: Arquivo do storage (S3) + registro do banco
  - **Hard delete**: Remove fisicamente

---

### 📜 Audit Log

#### View Entity Audit History
- [ ] **GET /audit/:entityType/:entityId**
  - **História**: Como um **ADMIN**, quero **ver histórico de mudanças em uma entidade** para que **eu entenda o que aconteceu** (ex: "Quem mudou o valor desse deal?").
  - **Requer**: Role ADMIN ou OWNER
  - **Aceita**: entityType = CUSTOMER | DEAL | USER | ORGANIZATION
  - **Retorna**:
    ```json
    [
      {
        "id": "...",
        "action": "UPDATE",
        "user": { "id": "...", "name": "João" },
        "changes": {
          "before": { "value": 50000, "stage": "PROPOSAL" },
          "after": { "value": 45000, "stage": "NEGOTIATION" }
        },
        "ipAddress": "192.168.1.1",
        "createdAt": "2025-10-29T10:30:00Z"
      }
    ]
    ```

#### Filter Audit Logs
- [ ] **GET /audit**
  - **História**: Como um **ADMIN**, quero **filtrar logs de auditoria** para que **eu investigue ações específicas** (ex: "Quem deletou customers essa semana?").
  - **Requer**: Role ADMIN ou OWNER
  - **Query params**: `?userId=xxx&action=DELETE&entityType=CUSTOMER&dateFrom=2025-10-01`
  - **Retorna**: Lista paginada de audit logs

---

### 💾 Export/Import Features

#### Export Customers
- [ ] **GET /customers/export**
  - **História**: Como um **ADMIN**, quero **exportar clientes para CSV/Excel** para que **eu faça backup ou análise externa**.
  - **Requer**: Role ADMIN ou OWNER
  - **Query params**: `?format=csv&status=CUSTOMER&fields=companyName,cnpj,industry`
  - **Filtra**: Por organizationId e permissões (SALES só seus)
  - **Retorna**: Arquivo CSV/XLSX para download

#### Import Customers
- [ ] **POST /customers/import**
  - **História**: Como um **ADMIN**, quero **importar clientes de outro sistema** para que **eu migre dados facilmente**.
  - **Requer**: Role ADMIN ou OWNER
  - **Aceita**: Arquivo CSV/XLSX + mapeamento de campos
  - **Valida**: Formato, campos obrigatórios, duplicatas (por CNPJ)
  - **Processa**: Assíncrono (background job)
  - **Retorna**: `{ jobId: "...", status: "PROCESSING" }`

#### Check Import Status
- [ ] **GET /customers/import/:jobId**
  - **História**: Como um **ADMIN**, quero **acompanhar progresso da importação** para que **eu saiba quando terminar**.
  - **Retorna**:
    ```json
    {
      "jobId": "...",
      "status": "COMPLETED",
      "totalRows": 500,
      "imported": 487,
      "errors": 13,
      "errorDetails": [
        { "row": 23, "error": "CNPJ inválido" }
      ]
    }
    ```

---

## 🚀 FASE 3 - Integrações & Features Avançadas

### 📧 Email Integration

#### Send Email from CRM
- [ ] **POST /emails/send**
  - **História**: Como um **vendedor**, quero **enviar emails direto do CRM** para que **tudo fique registrado automaticamente**.
  - **Aceita**: `{ to, cc?, subject, body, customerId, contactId?, templateId? }`
  - **Envia**: Via SMTP ou serviço (SendGrid, AWS SES)
  - **Cria**: Interaction automática do tipo EMAIL
  - **Retorna**: Status do envio

#### Create Email Template
- [ ] **POST /email-templates**
  - **História**: Como um **ADMIN**, quero **criar templates de email** para que **vendedores usem mensagens padronizadas** (ex: "Proposta comercial", "Follow-up pós-reunião").
  - **Requer**: Role ADMIN ou OWNER
  - **Aceita**: `{ name, subject, body, variables }`
  - **Suporta**: Variáveis dinâmicas: `{{customerName}}`, `{{contactName}}`

#### List Email Templates
- [ ] **GET /email-templates**
  - **História**: Como um **vendedor**, quero **escolher um template** para que **eu envie emails mais rápido**.
  - **Retorna**: Lista de templates da organization

#### Update Email Template
- [ ] **PUT /email-templates/:id**
  - **História**: Como um **ADMIN**, quero **editar templates** para que **mensagens fiquem sempre atualizadas**.
  - **Requer**: Role ADMIN ou OWNER

#### Delete Email Template
- [ ] **DELETE /email-templates/:id**
  - **História**: Como um **ADMIN**, quero **remover templates obsoletos** para que **lista fique limpa**.
  - **Requer**: Role ADMIN ou OWNER

---

### 🔗 Webhooks

#### Register Webhook
- [ ] **POST /webhooks**
  - **História**: Como um **desenvolvedor integrador**, quero **registrar webhooks** para que **meu sistema seja notificado de eventos no CRM** (ex: notificar Slack quando deal fecha).
  - **Requer**: Role OWNER
  - **Aceita**: `{ url, events: ['deal.won', 'customer.created'], secret }`
  - **Valida**: URL válida, SSL (https)
  - **Retorna**: Webhook criado com secret para validação

#### List Webhooks
- [ ] **GET /webhooks**
  - **História**: Como um **OWNER**, quero **ver webhooks registrados** para que **eu gerencie integrações**.
  - **Requer**: Role OWNER
  - **Retorna**: Lista de webhooks ativos

#### Delete Webhook
- [ ] **DELETE /webhooks/:id**
  - **História**: Como um **OWNER**, quero **remover webhook** para que **integrações antigas não recebam mais eventos**.
  - **Requer**: Role OWNER

#### Test Webhook
- [ ] **POST /webhooks/:id/test**
  - **História**: Como um **desenvolvedor**, quero **testar webhook** para que **eu confirme que está funcionando** antes de ativar.
  - **Envia**: Payload de teste para URL configurada
  - **Retorna**: Status da resposta (200, 404, timeout, etc)

---

### ⚙️ Custom Fields

#### Create Custom Field Definition
- [ ] **POST /custom-fields**
  - **História**: Como um **OWNER**, quero **criar campos personalizados** para que **eu capture dados específicos do meu negócio** (ex: empresa de varejo quer "Número de lojas físicas").
  - **Requer**: Role OWNER
  - **Aceita**: `{ entityType: 'CUSTOMER', name: 'numStores', type: 'NUMBER', required: false }`
  - **Tipos**: TEXT, NUMBER, DATE, BOOLEAN, SELECT (com options)

#### List Custom Fields
- [ ] **GET /custom-fields**
  - **História**: Como um **desenvolvedor**, quero **ver campos personalizados definidos** para que **eu renderize formulários dinamicamente**.
  - **Query params**: `?entityType=CUSTOMER`
  - **Retorna**: Lista de definições

#### Update Custom Field Definition
- [ ] **PUT /custom-fields/:id**
  - **História**: Como um **OWNER**, quero **editar campo personalizado** para que **eu ajuste conforme necessidade evolui**.
  - **Requer**: Role OWNER

#### Delete Custom Field Definition
- [ ] **DELETE /custom-fields/:id**
  - **História**: Como um **OWNER**, quero **remover campo que não uso mais** para que **formulários fiquem limpos**.
  - **Requer**: Role OWNER
  - **Valida**: Nenhuma entidade está usando (ou oferece migração)

---

### 🎨 Pipeline Stages Customization

#### List Pipeline Stages
- [ ] **GET /pipeline-stages**
  - **História**: Como um **usuário**, quero **ver stages configuradas** para que **eu saiba quais usar nos deals**.
  - **Retorna**: Lista ordenada de stages com probability padrão

#### Create Pipeline Stage
- [ ] **POST /pipeline-stages**
  - **História**: Como um **OWNER**, quero **customizar etapas do funil** para que **reflita meu processo de vendas** (ex: adicionar stage "Prova de Conceito").
  - **Requer**: Role OWNER
  - **Aceita**: `{ name: 'POC', color: '#FF5733', probability: 60, order: 3 }`

#### Update Pipeline Stage
- [ ] **PUT /pipeline-stages/:id**
  - **História**: Como um **OWNER**, quero **ajustar stages** para que **processo esteja sempre otimizado**.
  - **Requer**: Role OWNER

#### Reorder Pipeline Stages
- [ ] **PUT /pipeline-stages/reorder**
  - **História**: Como um **OWNER**, quero **reorganizar ordem das stages** para que **funil faça sentido visualmente**.
  - **Requer**: Role OWNER
  - **Aceita**: `{ stageIds: ['id1', 'id2', 'id3'] }` (nova ordem)

#### Delete Pipeline Stage
- [ ] **DELETE /pipeline-stages/:id**
  - **História**: Como um **OWNER**, quero **remover stage não usada** para que **processo fique enxuto**.
  - **Requer**: Role OWNER
  - **Valida**: Nenhum deal está nessa stage (ou migra para outra)

---

### 💳 Billing & Subscription (SAAS)

#### Get Current Subscription
- [ ] **GET /billing/subscription**
  - **História**: Como um **OWNER**, quero **ver minha assinatura atual** para que **eu saiba plano, data de renovação, status**.
  - **Requer**: Role OWNER
  - **Retorna**:
    ```json
    {
      "plan": "PRO",
      "status": "active",
      "currentPeriodEnd": "2025-11-29",
      "cancelAtPeriodEnd": false,
      "amount": 19900,
      "currency": "BRL"
    }
    ```

#### Update Subscription (Upgrade/Downgrade)
- [ ] **PUT /billing/subscription/change-plan**
  - **História**: Como um **OWNER**, quero **fazer upgrade/downgrade de plano** para que **eu ajuste conforme crescimento**.
  - **Requer**: Role OWNER
  - **Aceita**: `{ newPlan: 'ENTERPRISE' }`
  - **Integra**: Stripe/PagSeguro para processar mudança
  - **Calcula**: Proration (valor proporcional)
  - **Retorna**: Novo plano + próxima cobrança

#### Cancel Subscription
- [ ] **POST /billing/subscription/cancel**
  - **História**: Como um **OWNER**, quero **cancelar assinatura** para que **não seja cobrado mais** (mas mantendo acesso até fim do período pago).
  - **Requer**: Role OWNER
  - **Atualiza**: `cancelAtPeriodEnd = true`
  - **NÃO desativa**: Imediatamente (desativa em currentPeriodEnd)

#### Reactivate Subscription
- [ ] **POST /billing/subscription/reactivate**
  - **História**: Como um **OWNER que cancelou**, quero **reativar antes de expirar** para que **eu não perca acesso**.
  - **Requer**: Role OWNER
  - **Valida**: Ainda está dentro do período pago
  - **Atualiza**: `cancelAtPeriodEnd = false`

#### Update Payment Method
- [ ] **PUT /billing/payment-method**
  - **História**: Como um **OWNER**, quero **atualizar cartão de crédito** para que **pagamentos continuem funcionando**.
  - **Requer**: Role OWNER
  - **Integra**: Stripe/PagSeguro para trocar meio de pagamento
  - **Retorna**: Confirmação

#### Get Invoices
- [ ] **GET /billing/invoices**
  - **História**: Como um **OWNER**, quero **ver histórico de faturas** para que **eu tenha comprovantes de pagamento**.
  - **Requer**: Role OWNER
  - **Retorna**: Lista de invoices com PDF URL

---

### 📊 Advanced Reports

#### Custom Report Builder
- [ ] **POST /reports/custom**
  - **História**: Como um **analista**, quero **criar relatórios personalizados** para que **eu extraia insights específicos**.
  - **Aceita**: Query builder JSON (fields, filters, aggregations)
  - **Executa**: Query dinamicamente (com limites de segurança)
  - **Retorna**: Dados + opção de salvar report

#### Saved Reports
- [ ] **GET /reports/saved**
  - **História**: Como um **usuário**, quero **salvar relatórios favoritos** para que **eu execute rapidamente depois**.
  - **Retorna**: Lista de reports salvos do usuário

---

### 🔄 Integrations Marketplace

#### List Available Integrations
- [ ] **GET /integrations/available**
  - **História**: Como um **OWNER**, quero **ver integrações disponíveis** para que **eu conecte outras ferramentas** (Gmail, Slack, WhatsApp, Zapier).
  - **Retorna**: Lista de integrações com status (available, coming soon)

#### Enable Integration
- [ ] **POST /integrations/:integrationId/enable**
  - **História**: Como um **OWNER**, quero **ativar integração** para que **sistemas conversem entre si**.
  - **Exemplo**: Integração com Google Calendar para sincronizar meetings
  - **Requer**: OAuth flow ou API key

#### Configure Integration
- [ ] **PUT /integrations/:integrationId/config**
  - **História**: Como um **OWNER**, quero **configurar parâmetros da integração** para que **funcione do meu jeito** (ex: canal do Slack para notificações).
  - **Aceita**: Configurações específicas de cada integração

#### Disable Integration
- [ ] **DELETE /integrations/:integrationId**
  - **História**: Como um **OWNER**, quero **desativar integração** para que **pare de sincronizar**.
  - **Requer**: Role OWNER

---

## 🛡️ SEGURANÇA - Todas as Fases

### Rate Limiting
- [ ] **Middleware: rateLimit**
  - **História**: Como **sistema**, quero **limitar requisições por IP/usuário** para que **não sofra ataques de força bruta ou DDoS**.
  - **Implementa**: Express-rate-limit
  - **Limites sugeridos**: 
    - Login: 5 tentativas/15min
    - API geral: 100 req/min por usuário

### SQL Injection Protection
- [ ] **Garantido por TypeORM**
  - **História**: Como **sistema**, quero **prevenir SQL Injection** para que **banco esteja protegido**.
  - **TypeORM**: Usa prepared statements automaticamente

### XSS Protection
- [ ] **Middleware: helmet + sanitização**
  - **História**: Como **sistema**, quero **prevenir ataques XSS** para que **usuários não executem scripts maliciosos**.
  - **Implementa**: Helmet.js + sanitize inputs

### CSRF Protection
- [ ] **Middleware: csurf (se usar cookies)**
  - **História**: Como **sistema**, quero **prevenir CSRF** para que **atacantes não façam ações em nome de usuários**.
  - **Nota**: Se usar JWT puro (sem cookies), CSRF não é necessário

### CORS Configuration
- [ ] **Middleware: cors**
  - **História**: Como **sistema**, quero **controlar origens permitidas** para que **apenas frontend autorizado acesse API**.
  - **Configura**: Origins permitidas (ex: https://app.seucrm.com)

### Security Headers
- [ ] **Middleware: helmet**
  - **História**: Como **sistema**, quero **adicionar headers de segurança** para que **navegador proteja usuários**.
  - **Adiciona**: X-Content-Type-Options, X-Frame-Options, CSP, etc

### Sensitive Data Masking
- [ ] **NÃO retornar password em responses**
  - **História**: Como **sistema**, quero **nunca expor senhas** para que **credenciais fiquem seguras**.
  - **Implementa**: Excluir campo `password` de DTOs de resposta

---

## 🧪 TESTES - Todas as Fases

### Unit Tests
- [ ] **Testes de Services**
  - **História**: Como **desenvolvedor**, quero **testar lógica de negócio isoladamente** para que **eu garanta funcionamento correto**.
  - **Cobre**: Cálculos, validações, transformações
  - **Framework**: Jest

### Integration Tests
- [ ] **Testes de API Endpoints**
  - **História**: Como **desenvolvedor**, quero **testar endpoints completos** para que **eu garanta integração entre camadas**.
  - **Cobre**: Request → Controller → Service → Repository → Response
  - **Framework**: Supertest + Jest

### E2E Tests
- [ ] **Testes de Fluxos Completos**
  - **História**: Como **QA**, quero **testar jornadas do usuário** para que **sistema funcione de ponta a ponta**.
  - **Exemplos**: Cadastro → Login → Criar customer → Criar deal → Fechar deal
  - **Framework**: Jest + banco de testes

### Load Testing
- [ ] **Testes de Performance**
  - **História**: Como **DevOps**, quero **testar sob carga** para que **sistema aguente muitos usuários simultâneos**.
  - **Framework**: k6 ou Artillery
  - **Mede**: Requests/segundo, latência, taxa de erro

---

## 📚 DOCUMENTAÇÃO

### API Documentation (Swagger)
- [ ] **Gerar docs automáticos**
  - **História**: Como **desenvolvedor frontend**, quero **documentação interativa da API** para que **eu saiba como consumir endpoints**.
  - **Implementa**: @nestjs/swagger ou swagger-jsdoc
  - **Acesso**: GET /api-docs

### Postman Collection
- [ ] **Coleção pronta para importar**
  - **História**: Como **desenvolvedor**, quero **testar API facilmente** para que **eu não precise montar requests manualmente**.
  - **Exporta**: JSON com todos endpoints, exemplos, environments

### README Completo
- [ ] **Documentar setup do projeto**
  - **História**: Como **novo desenvolvedor**, quero **instruções claras** para que **eu rode o projeto localmente**.
  - **Inclui**: Pré-requisitos, instalação, env vars, migrations, testes

### Architecture Decision Records (ADRs)
- [ ] **Documentar decisões importantes**
  - **História**: Como **time**, queremos **registrar por que fizemos escolhas** para que **futuro entenda contexto** (ex: "Por que TypeORM e não Prisma?").

### Database Schema Documentation
- [ ] **Diagrama ER + descrições**
  - **História**: Como **desenvolvedor**, quero **entender estrutura do banco** para que **eu faça queries corretas**.
  - **Ferramentas**: Mermaid, dbdiagram.io, draw.io

---

## 🚀 DEVOPS

### Docker Setup
- [ ] **Dockerfile + docker-compose.yml**
  - **História**: Como **desenvolvedor**, quero **rodar projeto em containers** para que **ambiente seja consistente**.
  - **Inclui**: API, PostgreSQL, Redis (cache)

### CI/CD Pipeline
- [ ] **GitHub Actions**
  - **História**: Como **time**, queremos **automatizar deploy** para que **mudanças cheguem rápido em produção**.
  - **Stages**: Lint → Test → Build → Deploy

### Environment Variables Management
- [ ] **.env.example + validação**
  - **História**: Como **DevOps**, quero **gerenciar configs facilmente** para que **ambientes sejam configurados corretamente**.
  - **Valida**: Variáveis obrigatórias no startup

### Database Migrations Strategy
- [ ] **TypeORM migrations**
  - **História**: Como **desenvolvedor**, quero **versionar mudanças no banco** para que **deploys sejam seguros**.
  - **Comandos**: `npm run migration:generate`, `npm run migration:run`

### Backup Strategy
- [ ] **Backups automáticos do PostgreSQL**
  - **História**: Como **CTO**, quero **backups regulares** para que **dados nunca sejam perdidos**.
  - **Implementa**: Cron job diário → AWS S3

### Monitoring & Logging
- [ ] **Logs estruturados + APM**
  - **História**: Como **DevOps**, quero **monitorar erros e performance** para que **eu resolva problemas rápido**.
  - **Ferramentas**: Winston (logs) + Sentry (erros) + DataDog/New Relic (APM)

### Health Check Endpoint
- [ ] **GET /health**
  - **História**: Como **load balancer**, quero **verificar se API está saudável** para que **eu roteie tráfego corretamente**.
  - **Verifica**: Banco conectado, Redis conectado, disco com espaço
  - **Retorna**: `{ status: 'ok', timestamp, uptime, dependencies: {...} }`
