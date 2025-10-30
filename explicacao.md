1. ORGANIZATION (A empresa que CONTRATA seu CRM)
Organization {
  id: uuid                    
  name: string               
  slug: string (unique)      
  cnpj: string               
  plan: enum                 
  maxUsers: number           
  isActive: boolean          
  subscriptionEndsAt: date   
  createdAt: date            
  updatedAt: date            
}
```

### 📖 Explicação Campo a Campo:

**`id`**: Identificador único da organização
- Usa UUID em vez de número sequencial (mais seguro para SAAS)

**`name`**: Nome da empresa que contratou
- Ex: "Empresa ABC Ltda", "Tech Solutions"

**`slug`**: Identificador amigável para URLs
- Ex: "empresa-abc", "tech-solutions"
- Usado em: `app.seucrm.com/empresa-abc/dashboard`
- **DEVE SER ÚNICO** no sistema todo

**`cnpj`**: Documento da empresa
- Validação: apenas números, 14 dígitos
- Usado para: emissão de nota fiscal, validações

**`plan`**: Plano contratado
- Valores: `'FREE' | 'BASIC' | 'PRO' | 'ENTERPRISE'`
- **Define limites e features disponíveis**

**`maxUsers`**: Quantos usuários podem cadastrar
- FREE: 1, BASIC: 5, PRO: 20, ENTERPRISE: ilimitado
- **Valida na hora de criar novo User**

**`isActive`**: Conta está ativa?
- `false` = bloqueada (não pagou, cancelou)
- **Middleware da API checa isso antes de qualquer operação**

**`subscriptionEndsAt`**: Quando expira o plano
- Usada para: avisar antes de expirar, bloquear acesso

**`createdAt/updatedAt`**: Auditoria automática

---

### 🔧 Como usa na API:

**POST /auth/register** (cadastro inicial)
```
Recebe: { name, email, password }
Cria: Organization + primeiro User (role: OWNER)
Retorna: token JWT com { userId, organizationId }
```

**GET /organization/settings** (configurações)
```
Requer: token JWT
Retorna: dados da organização do usuário logado
Permite: OWNER e ADMIN editarem
```

**PUT /organization/upgrade** (mudar plano)
```
Recebe: { newPlan: 'PRO' }
Atualiza: plan, maxUsers, subscriptionEndsAt
Integra com: Stripe/PagSeguro
```

---

## 👤 2. USER (Funcionário DENTRO da empresa cliente)
```
User {
  id: uuid
  organizationId: uuid (FK)  
  email: string (unique)     
  password: string           
  firstName: string          
  lastName: string           
  role: enum                 
  avatar: string             
  isActive: boolean          
  lastLoginAt: date          
  createdAt: date
  updatedAt: date
}
📖 Explicação:
organizationId: 🔴 CAMPO MAIS IMPORTANTE

Vincula usuário à empresa dele
TODA query na API deve filtrar por isso
Garante que User da Org A não vê dados da Org B

email: Login único

Unique global ou unique por organization?
Recomendo: unique global (mais simples)
Ex: joao@empresa.com pode existir só uma vez no sistema

password: Senha criptografada

NUNCA salva texto puro
Usa: bcrypt com salt de 10 rounds
Na API: nunca retorna esse campo no JSON

role: Nível de permissão
typescriptenum UserRole {
  OWNER = 'OWNER',        // Criou a conta, pode tudo
  ADMIN = 'ADMIN',        // Pode gerenciar users e configs
  MANAGER = 'MANAGER',    // Vê dados de toda equipe
  SALES = 'SALES',        // Vê apenas seus clientes
  SUPPORT = 'SUPPORT'     // Acesso limitado, só leitura
}
```

**`avatar`**: URL da foto
- Salva apenas a URL (ex: AWS S3, Cloudinary)
- Não salva a imagem no banco

**`isActive`**: Usuário ativo?
- OWNER pode desativar funcionários
- Desativado não consegue fazer login

**`lastLoginAt`**: Último acesso
- Analytics: usuários ativos/inativos
- Security: detectar acessos suspeitos

---

### 🔧 Como usa na API:

**POST /auth/login**
```
Recebe: { email, password }
Valida: bcrypt.compare(password, user.password)
Valida: user.isActive === true
Valida: user.organization.isActive === true
Retorna: JWT com { userId, organizationId, role }
```

**POST /users** (OWNER/ADMIN convida novo usuário)
```
Requer: role OWNER ou ADMIN
Valida: organization.users.length < organization.maxUsers
Recebe: { email, firstName, lastName, role }
Cria: User com organizationId do criador
Envia: email de convite com link para definir senha
```

**GET /users** (listar equipe)
```
Requer: token JWT
Filtra: WHERE organizationId = user.organizationId
MANAGER/OWNER: vê todos
SALES: vê apenas ele mesmo
```

---

## 🏭 3. CUSTOMER (Empresa cliente DO SEU CLIENTE)
```
Customer {
  id: uuid
  organizationId: uuid (FK)    
  ownerId: uuid (FK -> User)   
  companyName: string          
  cnpj: string                 
  industry: string             
  website: string              
  employeeCount: number        
  annualRevenue: decimal       
  address: json                
  status: enum                 
  source: string               
  createdAt: date
  updatedAt: date
  deletedAt: date (soft delete)
}
📖 Explicação:
organizationId: Isola customers por organização

Empresa ABC só vê seus próprios customers

ownerId: Vendedor responsável

FK para User
Define "dono da conta"
Permissão SALES: só vê customers onde ownerId = userId

companyName: Nome da empresa cliente

Ex: "Magazine Luiza", "Ambev"

industry: Setor/Segmento

Ex: "Varejo", "Tecnologia", "Saúde"
Usado para: relatórios, segmentação

employeeCount: Tamanho da empresa

Qualifica o lead (PME vs Corporativo)

annualRevenue: Faturamento anual

Tipo: DECIMAL(15,2) - suporta até bilhões
Usado para: priorização, previsão de ticket médio

address: Endereço completo
json{
  "street": "Av Paulista, 1000",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01310-100",
  "country": "Brasil"
}

Tipo: JSON/JSONB (PostgreSQL)
Por que JSON? Flexível para diferentes formatos por país

status: Estágio no funil
typescriptenum CustomerStatus {
  LEAD = 'LEAD',           // Contato inicial
  PROSPECT = 'PROSPECT',   // Qualificado, interesse
  CUSTOMER = 'CUSTOMER',   // Cliente ativo
  CHURNED = 'CHURNED'      // Perdeu o cliente
}
```

**`source`**: De onde veio?
- Ex: "Website", "Indicação", "LinkedIn", "Evento"
- Analytics: qual canal traz mais clientes

**`deletedAt`**: Soft delete
- Não deleta fisicamente
- Marca como deletado com timestamp
- Por quê? Auditoria, restauração, relatórios históricos

---

### 🔧 Como usa na API:

**POST /customers**
```
Requer: role SALES, MANAGER ou ADMIN
Recebe: { companyName, cnpj, industry, ... }
Cria: Customer com organizationId do user
Define: ownerId = userId (quem criou é dono)
Valida: CNPJ único por organizationId
```

**GET /customers**
```
Requer: token JWT
Filtra SEMPRE: WHERE organizationId = user.organizationId

Se role = SALES:
  WHERE ownerId = userId (só seus clientes)
  
Se role = MANAGER/ADMIN:
  WHERE organizationId = ... (todos da org)
  
Permite filtros: ?status=PROSPECT&industry=Tecnologia
Permite busca: ?search=Magazine (busca no nome)
```

**PUT /customers/:id**
```
Valida: customer.organizationId === user.organizationId
Se role = SALES: valida customer.ownerId === user.userId
Permite: atualizar qualquer campo exceto id, organizationId
```

**PUT /customers/:id/transfer** (transferir dono)
```
Requer: role MANAGER ou ADMIN
Recebe: { newOwnerId }
Valida: newOwner.organizationId === customer.organizationId
Atualiza: ownerId
```

---

## 👔 4. CONTACT (Pessoa física dentro do Customer)
```
Contact {
  id: uuid
  organizationId: uuid (FK)
  customerId: uuid (FK)
  firstName: string
  lastName: string
  email: string
  phone: string
  position: string            
  isPrimary: boolean          
  linkedin: string
  notes: text
  createdAt: date
  updatedAt: date
}
```

### 📖 Explicação:

**`customerId`**: A qual empresa pertence
- FK para Customer
- Um customer tem N contacts

**`position`**: Cargo na empresa
- Ex: "CEO", "Gerente de Compras", "CTO"
- **Importante**: define quem toma decisão

**`isPrimary`**: Contato principal?
- `true` para apenas 1 contact por customer
- O contato principal recebe emails importantes

**`linkedin`**: Perfil LinkedIn
- Facilita pesquisa de contexto
- Networking

**`notes`**: Observações livres
- Tipo: TEXT (até 65.535 caracteres)
- Ex: "Prefere contato por WhatsApp", "Aniversário em Maio"

---

### 🔧 Como usa na API:

**POST /customers/:customerId/contacts**
```
Valida: customer pertence à organizationId do user
Se role=SALES: valida customer.ownerId === userId
Recebe: { firstName, lastName, email, position, isPrimary }
Se isPrimary=true: remove isPrimary dos outros contacts
```

**GET /customers/:customerId/contacts**
```
Retorna: todos contacts do customer
Ordena: isPrimary DESC, firstName ASC
Útil para: selecionar com quem falar
```

**Uso real**:
- Vendedor liga para "José (CEO)" mas se não atender, tenta "Maria (Gerente TI)"
- Email marketing: envia para contacts com isPrimary=true

---

## 💬 5. INTERACTION (Histórico completo)
```
Interaction {
  id: uuid
  organizationId: uuid (FK)
  customerId: uuid (FK)
  contactId: uuid (FK) nullable
  userId: uuid (FK)           
  type: enum
  subject: string
  description: text
  duration: number (minutos)
  scheduledAt: date nullable
  completedAt: date nullable
  createdAt: date
}
📖 Explicação:
contactId: Com qual pessoa foi?

Pode ser NULL (ex: reunião com vários, nota geral)

userId: Quem fez a interação

Para saber qual vendedor está ativo

type: Tipo de interação
typescriptenum InteractionType {
  EMAIL = 'EMAIL',
  CALL = 'CALL',           // Ligação
  MEETING = 'MEETING',     // Reunião
  NOTE = 'NOTE',           // Anotação interna
  TASK = 'TASK',           // Tarefa completada
  WHATSAPP = 'WHATSAPP'
}
```

**`subject`**: Título/Assunto
- Ex: "Proposta comercial enviada", "Follow-up após demo"

**`description`**: Detalhes
- Texto longo com resumo da interação
- Ex: "Cliente gostou da demo mas pediu desconto. Prometeu resposta até sexta."

**`duration`**: Tempo gasto (minutos)
- Relevante para CALL e MEETING
- NULL para EMAIL e NOTE
- Analytics: tempo médio por tipo

**`scheduledAt`**: Quando foi agendado
- Para reuniões futuras
- Se NULL, já aconteceu

**`completedAt`**: Quando foi concluído
- Se NULL, ainda pendente (reunião futura)

---

### 🔧 Como usa na API:

**POST /interactions**
```
Recebe: { 
  customerId, 
  contactId (opcional),
  type: 'CALL',
  subject: 'Follow-up',
  description: '...',
  duration: 30
}
Cria: com userId do user logado
Cria: com organizationId do customer
```

**GET /customers/:id/timeline**
```
Busca: todas interactions do customer
Ordena: createdAt DESC (mais recente primeiro)
Agrupa: por data
Retorna: timeline completo

Exemplo de resposta:
{
  "2025-10-29": [
    { type: 'CALL', subject: '...', user: 'João' },
    { type: 'EMAIL', subject: '...', user: 'Maria' }
  ],
  "2025-10-28": [...]
}
```

**Uso real**:
- Ver histórico completo antes de ligar
- Outro vendedor assumir conta e entender contexto
- Relatório: quantas interações por vendedor/mês

---

## 💰 6. DEAL/OPPORTUNITY (Negociação em andamento)
```
Deal {
  id: uuid
  organizationId: uuid (FK)
  customerId: uuid (FK)
  ownerId: uuid (FK -> User)
  title: string
  value: decimal
  stage: enum
  probability: number (0-100)
  expectedCloseDate: date
  lostReason: string nullable
  createdAt: date
  updatedAt: date
  closedAt: date nullable
}
📖 Explicação:
title: Nome da oportunidade

Ex: "Renovação anual", "Upgrade para plano PRO", "Venda inicial"

value: Valor estimado (R$)

Tipo: DECIMAL(15,2)
Usado para: previsão de receita, pipeline

stage: Estágio no pipeline
typescriptenum DealStage {
  QUALIFICATION = 'QUALIFICATION',   // Entendendo necessidade
  PROPOSAL = 'PROPOSAL',             // Proposta enviada
  NEGOTIATION = 'NEGOTIATION',       // Negociando valores/termos
  CLOSED_WON = 'CLOSED_WON',        // Ganhou! 🎉
  CLOSED_LOST = 'CLOSED_LOST'       // Perdeu 😢
}
```

**`probability`**: Chance de fechar (%)
- 0 a 100
- Exemplo: QUALIFICATION=25%, PROPOSAL=50%, NEGOTIATION=75%
- **Multiplica value x probability = receita esperada**

**`expectedCloseDate`**: Previsão de fechamento
- Analytics: receita prevista por mês
- Ex: "Devo fechar R$ 500k em Novembro"

**`lostReason`**: Por que perdeu?
- Só preenche se stage = CLOSED_LOST
- Ex: "Preço alto", "Escolheu concorrente", "Sem budget"
- **Análise**: por que estamos perdendo?

**`closedAt`**: Quando fechou (ganhou ou perdeu)
- NULL se ainda em andamento
- Analytics: tempo médio até fechar

---

### 🔧 Como usa na API:

**POST /deals**
```
Recebe: { 
  customerId, 
  title, 
  value: 50000,
  stage: 'QUALIFICATION',
  probability: 25,
  expectedCloseDate: '2025-12-15'
}
Cria: com ownerId = userId
Cria: Interaction automática "Deal criado"
```

**PUT /deals/:id/stage**
```
Recebe: { newStage: 'PROPOSAL' }
Atualiza: stage
Atualiza: probability (mapeia stage -> probability padrão)
Se CLOSED_WON ou CLOSED_LOST:
  - Define closedAt = now()
  - Se LOST, exige lostReason
Cria: Interaction automática "Deal movido para X"
```

**GET /deals/pipeline**
```
Agrupa: por stage
Soma: value de cada stage
Calcula: value * (probability/100) = receita esperada

Exemplo resposta:
{
  "QUALIFICATION": { count: 5, value: 250000, weighted: 62500 },
  "PROPOSAL": { count: 3, value: 150000, weighted: 75000 },
  "NEGOTIATION": { count: 2, value: 100000, weighted: 75000 },
  "total_weighted": 212500 // Receita esperada
}
```

**Uso real**:
- Dashboard com pipeline visual (colunas Kanban)
- Previsão de receita para CEO
- Análise: deals perdidos por motivo

---

## ✅ 7. TASK (Tarefas/Follow-ups)
```
Task {
  id: uuid
  organizationId: uuid (FK)
  userId: uuid (FK)           
  customerId: uuid (FK)
  dealId: uuid (FK) nullable
  title: string
  description: text
  type: enum
  priority: enum
  dueDate: date
  status: enum
  completedAt: date nullable
  createdAt: date
}
📖 Explicação:
userId: Para quem é a tarefa

Pode criar tarefa para outro vendedor (se MANAGER)

dealId: Relacionado a qual negociação?

Pode ser NULL (tarefa genérica do customer)

type: Tipo de ação
typescriptenum TaskType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  FOLLOW_UP = 'FOLLOW_UP',
  DEMO = 'DEMO',
  PROPOSAL = 'PROPOSAL',
  MEETING = 'MEETING'
}
priority: Urgência
typescriptenum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}
dueDate: Prazo

Somente data (sem hora)
UI mostra: "Hoje", "Amanhã", "Atrasada"

status: Estado
typescriptenum TaskStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
```

**`completedAt`**: Quando foi feito
- NULL se status != COMPLETED

---

### 🔧 Como usa na API:

**POST /tasks**
```
Recebe: {
  customerId,
  dealId (opcional),
  title: 'Ligar para cliente',
  type: 'CALL',
  priority: 'HIGH',
  dueDate: '2025-10-30'
}
Cria: com userId = user logado
Se MANAGER: pode especificar userId diferente (delegar)
```

**GET /tasks/my** (minhas tarefas)
```
Filtra: userId = user logado
Filtra: status = PENDING
Ordena: priority DESC, dueDate ASC
Agrupa: por data (hoje, amanhã, próximos 7 dias, atrasadas)
```

**PUT /tasks/:id/complete**
```
Atualiza: status = COMPLETED, completedAt = now()
Cria: Interaction automática do tipo NOTE com descrição da tarefa
```

**Uso real**:
- Dashboard com "Você tem 5 tarefas para hoje"
- Notificações: "Tarefa atrasada: Ligar para Cliente X"
- Gamificação: ranking de quem completa mais tarefas

---

## 📦 8. PRODUCT (Catálogo de produtos/serviços)
```
Product {
  id: uuid
  organizationId: uuid (FK)
  name: string
  description: text
  price: decimal
  category: string
  isActive: boolean
  createdAt: date
  updatedAt: date
}
```

### 📖 Explicação:

**`name`**: Nome do produto/serviço
- Ex: "Plano PRO", "Consultoria Premium", "Licença Enterprise"

**`price`**: Preço padrão
- Tipo: DECIMAL(15,2)
- **Apenas referência** - pode ter desconto no deal

**`category`**: Categoria/Tipo
- Ex: "Software", "Consultoria", "Hardware"
- Facilita filtros

**`isActive`**: Produto ativo?
- Desativa produtos descontinuados (não deleta)

---

### 🔧 Como usa na API:

**POST /products**
```
Requer: role ADMIN
Recebe: { name, price, category, description }
```

**GET /products**
```
Filtra: isActive = true
Usa em: formulário de criar deal
```

---

## 🔗 9. DEALPRODUCT (Tabela de relacionamento N:N)
```
DealProduct {
  id: uuid
  dealId: uuid (FK)
  productId: uuid (FK)
  quantity: number
  unitPrice: decimal
  discount: decimal
  totalPrice: decimal
}
```

### 📖 Explicação:

**Por que essa tabela existe?**
- Um Deal pode ter vários produtos
- Um Produto pode estar em vários deals
- Relacionamento **Muitos-para-Muitos**

**`quantity`**: Quantidade
- Ex: 10 licenças

**`unitPrice`**: Preço unitário NESSE deal
- Pode ser diferente do Product.price (desconto)

**`discount`**: Desconto (%)
- Ex: 15

**`totalPrice`**: Cálculo final
- `(unitPrice * quantity) * (1 - discount/100)`
- Salva calculado (não recalcula sempre)

---

### 🔧 Como usa na API:

**POST /deals/:dealId/products**
```
Recebe: {
  productId,
  quantity: 10,
  unitPrice: 500,
  discount: 15
}
Calcula: totalPrice = (500 * 10) * (1 - 0.15) = 4250
Salva: DealProduct
Atualiza: Deal.value = soma de todos DealProducts
```

**GET /deals/:dealId/products**
```
Retorna: lista com dados do produto incluídos (JOIN)
[
  {
    id: '...',
    product: { name: 'Plano PRO', ... },
    quantity: 10,
    unitPrice: 500,
    discount: 15,
    totalPrice: 4250
  }
]

🎯 RESUMO: Como tudo se conecta na API
Fluxo típico de uso:

Cadastro → Cria Organization + User (OWNER)
Convite → OWNER cria outros Users
Prospecção → User cria Customers (leads)
Contatos → Adiciona Contacts nos Customers
Interações → Registra calls, emails (Interactions)
Oportunidade → Cria Deal vinculado ao Customer
Proposta → Adiciona Products ao Deal
Follow-up → Cria Tasks para não esquecer
Fechamento → Move Deal para CLOSED_WON
Análise → Relatórios de pipeline, conversão, etc.


🔒 Regras de Segurança (SEMPRE aplicar):
typescript// Middleware em TODA rota
async function checkOrganization(req, res, next) {
  const user = req.user; // do JWT
  const resourceId = req.params.id;
  
  // Busca o recurso (customer, deal, etc)
  const resource = await getResource(resourceId);
  
  // VALIDA se pertence à mesma organização
  if (resource.organizationId !== user.organizationId) {
    return res.status(403).json({ error: 'Acesso negado' });
  }
  
  next();
}
🎭 Regras de Permissão:
typescript// SALES - só vê seus próprios customers
WHERE ownerId = userId

// MANAGER - vê todos da organização
WHERE organizationId = user.organizationId

// ADMIN - vê todos + pode gerenciar users
WHERE organizationId = user.organizationId

// OWNER - pode tudo + mudar plano + billing
WHERE organizationId = user.organizationId
