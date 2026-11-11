import { ValidationPipe } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import request from "supertest";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { AppModule } from "../src/app.module";
import { Organization } from "../src/entity/Organization";
import { User, UserRole } from "../src/entity/User";

type Credentials = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  cnpj: string;
};

const ownerCredentials: Credentials = {
  email: "owner@example.com",
  password: "Senha123!",
  firstName: "Owner",
  lastName: "Test",
  companyName: "Nuvora Test",
  cnpj: "12345678901234",
};

describe("Nuvora CRM API (e2e)", () => {
  let app: NestFastifyApplication;
  let server: unknown;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    server = app.getHttpServer();
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await dataSource.query(
      `TRUNCATE TABLE "deal_product", "task", "interaction", "contact", "deal", "customer", "user", "organization" RESTART IDENTITY CASCADE`,
    );
  });

  function auth(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  async function register(overrides: Partial<Credentials> = {}) {
    const body = { ...ownerCredentials, ...overrides };
    await request(server).post("/auth/register").send(body).expect(201);

    const login = await request(server)
      .post("/auth/login")
      .send({ email: body.email, password: body.password })
      .expect(201);

    return { token: login.body.accessToken as string, body };
  }

  async function createSalesUser(organizationId: string) {
    const repo = dataSource.getRepository(User);
    const user = repo.create({
      organizationId,
      email: "sales@example.com",
      password: await bcrypt.hash("Senha123!", 10),
      firstName: "Sales",
      lastName: "Test",
      role: UserRole.SALES,
      isActive: true,
    });
    return repo.save(user);
  }

  async function login(email: string, password: string) {
    const response = await request(server)
      .post("/auth/login")
      .send({ email, password })
      .expect(201);
    return response.body.accessToken as string;
  }

  async function createCustomer(token: string, companyName: string) {
    const response = await request(server)
      .post("/customers")
      .set(auth(token))
      .send({ companyName })
      .expect(201);
    return response.body;
  }

  async function createDeal(
    token: string,
    customerId: string,
    title = "Deal Test",
  ) {
    const response = await request(server)
      .post("/deals")
      .set(auth(token))
      .send({ customerId, title, value: 1000 })
      .expect(201);
    return response.body;
  }

  async function createContact(
    token: string,
    customerId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const response = await request(server)
      .post(`/customers/${customerId}/contacts`)
      .set(auth(token))
      .send({
        firstName: "Ana",
        lastName: "Silva",
        ...overrides,
      })
      .expect(201);
    return response.body;
  }

  async function createInteraction(
    token: string,
    customerId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const response = await request(server)
      .post(`/customers/${customerId}/interactions`)
      .set(auth(token))
      .send({
        type: "CALL",
        description: "Ligação de acompanhamento",
        ...overrides,
      })
      .expect(201);
    return response.body;
  }

  async function createTask(
    token: string,
    customerId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const dueDate = new Date(Date.now() + 86_400_000)
      .toISOString()
      .slice(0, 10);
    const response = await request(server)
      .post("/tasks")
      .set(auth(token))
      .send({
        customerId,
        title: "Tarefa de acompanhamento",
        type: "CALL",
        dueDate,
        ...overrides,
      })
      .expect(201);
    return response.body;
  }

  async function createProduct(
    token: string,
    overrides: Record<string, unknown> = {},
  ) {
    const response = await request(server)
      .post("/products")
      .set(auth(token))
      .send({ name: "Plano Pro", price: 100, ...overrides })
      .expect(201);
    return response.body;
  }

  async function addDealProduct(
    token: string,
    dealId: string,
    productId: string,
    overrides: Record<string, unknown> = {},
  ) {
    const response = await request(server)
      .post(`/deals/${dealId}/products`)
      .set(auth(token))
      .send({ productId, quantity: 1, ...overrides })
      .expect(201);
    return response.body;
  }

  it("returns the authenticated user profile without credentials", async () => {
    const owner = await register();

    const response = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    expect(response.body).toMatchObject({
      email: owner.body.email,
      role: UserRole.OWNER,
      organization: { name: owner.body.companyName },
    });
    expect(response.body.id).toBeDefined();
    expect(response.body.password).toBeUndefined();
    expect(response.body.resetToken).toBeUndefined();
    expect(response.body.organization.cnpj).toBe(owner.body.cnpj);
  });

  it("keeps stage changes on the dedicated endpoint", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Stage");
    const deal = await createDeal(owner.token, customer.id);
    expect(deal.customerName).toBe("Cliente Stage");

    await request(server)
      .patch(`/deals/${deal.id}`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_WON" })
      .expect(400);

    const won = await request(server)
      .patch(`/deals/${deal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_WON" })
      .expect(200);
    expect(won.body.stage).toBe("CLOSED_WON");
    expect(won.body.probability).toBe(100);
    expect(won.body.closedAt).toBeTruthy();
    expect(won.body.lostReason).toBeNull();

    await request(server)
      .patch(`/deals/${deal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_LOST" })
      .expect(400);

    const lost = await request(server)
      .patch(`/deals/${deal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_LOST", lostReason: "Preço" })
      .expect(200);
    expect(lost.body.lostReason).toBe("Preço");
    expect(lost.body.probability).toBe(0);

    const reopened = await request(server)
      .patch(`/deals/${deal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "NEGOTIATION" })
      .expect(200);
    expect(reopened.body.closedAt).toBeNull();
    expect(reopened.body.lostReason).toBeNull();
  });

  it("removes a deal", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Delete");
    const deal = await createDeal(owner.token, customer.id);

    await request(server)
      .delete(`/deals/${deal.id}`)
      .set(auth(owner.token))
      .expect(204);

    await request(server)
      .get(`/deals/${deal.id}`)
      .set(auth(owner.token))
      .expect(404);
  });

  it("scopes customers and deals by owner for non-management roles", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");

    const ownerCustomer = await createCustomer(owner.token, "Cliente Owner");
    const salesCustomer = await createCustomer(salesToken, "Cliente Sales");

    const salesCustomers = await request(server)
      .get("/customers")
      .set(auth(salesToken))
      .expect(200);
    expect(salesCustomers.body.map((customer) => customer.id)).toEqual([
      salesCustomer.id,
    ]);

    await request(server)
      .get(`/customers/${ownerCustomer.id}`)
      .set(auth(salesToken))
      .expect(404);

    const ownerDeal = await createDeal(
      owner.token,
      ownerCustomer.id,
      "Deal Owner",
    );

    await request(server)
      .get(`/deals/${ownerDeal.id}`)
      .set(auth(salesToken))
      .expect(404);

    const emptySalesDeals = await request(server)
      .get("/deals")
      .set(auth(salesToken))
      .expect(200);
    expect(emptySalesDeals.body.data).toHaveLength(0);
    expect(emptySalesDeals.body.meta.total).toBe(0);

    const salesDeal = await createDeal(
      salesToken,
      salesCustomer.id,
      "Deal Sales",
    );

    const salesDeals = await request(server)
      .get("/deals")
      .set(auth(salesToken))
      .expect(200);
    expect(salesDeals.body.data.map((deal) => deal.id)).toEqual([salesDeal.id]);

    const ownerDeals = await request(server)
      .get("/deals")
      .set(auth(owner.token))
      .expect(200);
    expect(ownerDeals.body.data).toHaveLength(2);
  });

  it("manages contacts and keeps a single primary contact", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Contatos");

    const first = await createContact(owner.token, customer.id, {
      isPrimary: true,
    });
    const second = await createContact(owner.token, customer.id, {
      firstName: "Bruno",
      isPrimary: true,
    });

    const list = await request(server)
      .get(`/customers/${customer.id}/contacts`)
      .set(auth(owner.token))
      .expect(200);

    expect(list.body.find((contact) => contact.id === first.id).isPrimary).toBe(
      false,
    );
    expect(
      list.body.find((contact) => contact.id === second.id).isPrimary,
    ).toBe(true);

    const updated = await request(server)
      .patch(`/customers/${customer.id}/contacts/${second.id}`)
      .set(auth(owner.token))
      .send({ position: "CTO", isPrimary: false })
      .expect(200);
    expect(updated.body.position).toBe("CTO");
    expect(updated.body.isPrimary).toBe(false);

    await request(server)
      .delete(`/customers/${customer.id}/contacts/${first.id}`)
      .set(auth(owner.token))
      .expect(204);

    await request(server)
      .get(`/customers/${customer.id}/contacts/${first.id}`)
      .set(auth(owner.token))
      .expect(404);
  });

  it("lists contacts across the organization", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Diretório");
    await createContact(owner.token, customer.id, {
      firstName: "Carla",
      lastName: "Diretório",
      email: "carla@example.com",
    });

    const response = await request(server)
      .get("/contacts")
      .query({ search: "Carla" })
      .set(auth(owner.token))
      .expect(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].customerName).toBe("Cliente Diretório");
    expect(response.body.meta.total).toBe(1);
  });

  it("scopes contacts by customer owner", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");
    const ownerCustomer = await createCustomer(owner.token, "Cliente Owner");

    await request(server)
      .get(`/customers/${ownerCustomer.id}/contacts`)
      .set(auth(salesToken))
      .expect(404);

    await request(server)
      .post(`/customers/${ownerCustomer.id}/contacts`)
      .set(auth(salesToken))
      .send({ firstName: "Sem", lastName: "Acesso" })
      .expect(404);
  });

  it("manages customer interactions with pagination and filters", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Interações");
    const contact = await createContact(owner.token, customer.id);

    const interaction = await createInteraction(owner.token, customer.id, {
      contactId: contact.id,
      subject: "Primeiro contato",
      duration: 15,
    });
    expect(interaction.contactId).toBe(contact.id);
    expect(interaction.userId).toBeDefined();

    const list = await request(server)
      .get(`/customers/${customer.id}/interactions`)
      .query({ type: "CALL", limit: 1 })
      .set(auth(owner.token))
      .expect(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.meta).toMatchObject({ page: 1, limit: 1, total: 1 });

    const updated = await request(server)
      .patch(`/customers/${customer.id}/interactions/${interaction.id}`)
      .set(auth(owner.token))
      .send({ description: "Ligação concluída" })
      .expect(200);
    expect(updated.body.description).toBe("Ligação concluída");

    await request(server)
      .delete(`/customers/${customer.id}/interactions/${interaction.id}`)
      .set(auth(owner.token))
      .expect(204);

    await request(server)
      .get(`/customers/${customer.id}/interactions/${interaction.id}`)
      .set(auth(owner.token))
      .expect(404);
  });

  it("rejects interactions with a contact from another customer", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente A");
    const otherCustomer = await createCustomer(owner.token, "Cliente B");
    const otherContact = await createContact(owner.token, otherCustomer.id);

    await request(server)
      .post(`/customers/${customer.id}/interactions`)
      .set(auth(owner.token))
      .send({
        type: "CALL",
        description: "Contato cruzado",
        contactId: otherContact.id,
      })
      .expect(404);
  });

  it("scopes interactions by customer owner", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");
    const ownerCustomer = await createCustomer(owner.token, "Cliente Owner");

    await request(server)
      .get(`/customers/${ownerCustomer.id}/interactions`)
      .set(auth(salesToken))
      .expect(404);

    await request(server)
      .post(`/customers/${ownerCustomer.id}/interactions`)
      .set(auth(salesToken))
      .send({ type: "CALL", description: "Sem acesso" })
      .expect(404);
  });

  it("manages tasks and status lifecycle", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Tarefas");
    const deal = await createDeal(owner.token, customer.id, "Deal Tarefas");

    const task = await createTask(owner.token, customer.id, {
      dealId: deal.id,
      priority: "HIGH",
    });
    expect(task.status).toBe("PENDING");
    expect(task.dealId).toBe(deal.id);
    expect(task.customerName).toBe("Cliente Tarefas");

    const list = await request(server)
      .get("/tasks")
      .query({ status: "PENDING", customerId: customer.id })
      .set(auth(owner.token))
      .expect(200);
    expect(list.body.data.map((item) => item.id)).toContain(task.id);

    const updated = await request(server)
      .patch(`/tasks/${task.id}`)
      .set(auth(owner.token))
      .send({ title: "Tarefa atualizada", priority: "LOW" })
      .expect(200);
    expect(updated.body.title).toBe("Tarefa atualizada");
    expect(updated.body.priority).toBe("LOW");

    const completed = await request(server)
      .patch(`/tasks/${task.id}/status`)
      .set(auth(owner.token))
      .send({ status: "COMPLETED" })
      .expect(200);
    expect(completed.body.status).toBe("COMPLETED");
    expect(completed.body.completedAt).toBeTruthy();

    const reopened = await request(server)
      .patch(`/tasks/${task.id}/status`)
      .set(auth(owner.token))
      .send({ status: "PENDING" })
      .expect(200);
    expect(reopened.body.completedAt).toBeNull();

    await request(server)
      .delete(`/tasks/${task.id}`)
      .set(auth(owner.token))
      .expect(204);

    await request(server)
      .get(`/tasks/${task.id}`)
      .set(auth(owner.token))
      .expect(404);
  });

  it("filters overdue tasks", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Atraso");
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);

    const task = await createTask(owner.token, customer.id, {
      dueDate: yesterday,
    });

    const response = await request(server)
      .get("/tasks")
      .query({ overdue: true })
      .set(auth(owner.token))
      .expect(200);
    expect(response.body.data.map((item) => item.id)).toContain(task.id);
  });

  it("scopes tasks by assignee", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    const sales = await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");
    const ownerCustomer = await createCustomer(owner.token, "Cliente Owner");

    const assignedToSales = await createTask(owner.token, ownerCustomer.id, {
      userId: sales.id,
    });
    await createTask(owner.token, ownerCustomer.id, {
      title: "Tarefa do owner",
    });

    const salesTasks = await request(server)
      .get("/tasks")
      .set(auth(salesToken))
      .expect(200);
    expect(salesTasks.body.data.map((item) => item.id)).toEqual([
      assignedToSales.id,
    ]);

    await request(server)
      .post("/tasks")
      .set(auth(salesToken))
      .send({
        customerId: ownerCustomer.id,
        title: "Sem acesso",
        type: "CALL",
        dueDate: new Date().toISOString().slice(0, 10),
      })
      .expect(404);

    await request(server)
      .patch(`/tasks/${assignedToSales.id}`)
      .set(auth(salesToken))
      .send({ userId: me.body.id })
      .expect(403);
  });

  it("manages products and restricts catalog writes", async () => {
    const owner = await register();
    const product = await createProduct(owner.token, {
      name: "Plano Enterprise",
      price: 250,
      category: "Planos",
    });
    expect(product.price).toBe(250);

    const list = await request(server)
      .get("/products")
      .query({ search: "Enterprise" })
      .set(auth(owner.token))
      .expect(200);
    expect(list.body.map((item) => item.id)).toContain(product.id);

    const updated = await request(server)
      .patch(`/products/${product.id}`)
      .set(auth(owner.token))
      .send({ price: 300, isActive: false })
      .expect(200);
    expect(updated.body.price).toBe(300);
    expect(updated.body.isActive).toBe(false);

    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);
    await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");

    await request(server)
      .post("/products")
      .set(auth(salesToken))
      .send({ name: "Sem permissão", price: 10 })
      .expect(403);

    await request(server).get("/products").set(auth(salesToken)).expect(200);

    await request(server)
      .delete(`/products/${product.id}`)
      .set(auth(owner.token))
      .expect(204);
  });

  it("manages deal products and recalculates totals", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Produtos");
    const deal = await createDeal(owner.token, customer.id, "Deal Produtos");
    const product = await createProduct(owner.token, {
      name: "Implantação",
      price: 100,
    });

    const line = await addDealProduct(owner.token, deal.id, product.id, {
      quantity: 2,
      discount: 10,
    });
    expect(line.productName).toBe("Implantação");
    expect(line.totalPrice).toBe(180);

    const lines = await request(server)
      .get(`/deals/${deal.id}/products`)
      .set(auth(owner.token))
      .expect(200);
    expect(lines.body).toHaveLength(1);

    const updated = await request(server)
      .patch(`/deals/${deal.id}/products/${line.id}`)
      .set(auth(owner.token))
      .send({ quantity: 3, unitPrice: 50, discount: 0 })
      .expect(200);
    expect(updated.body.totalPrice).toBe(150);

    await request(server)
      .delete(`/deals/${deal.id}`)
      .set(auth(owner.token))
      .expect(409);

    await request(server)
      .delete(`/deals/${deal.id}/products/${line.id}`)
      .set(auth(owner.token))
      .expect(204);

    await request(server)
      .delete(`/deals/${deal.id}`)
      .set(auth(owner.token))
      .expect(204);
  });

  it("scopes deal products by deal owner", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");
    const ownerCustomer = await createCustomer(owner.token, "Cliente Owner");
    const deal = await createDeal(owner.token, ownerCustomer.id, "Deal Owner");

    await request(server)
      .get(`/deals/${deal.id}/products`)
      .set(auth(salesToken))
      .expect(404);
  });

  it("summarizes the organization dashboard", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Dashboard");
    const wonCustomer = await createCustomer(owner.token, "Cliente Ganho");
    const deal = await createDeal(owner.token, customer.id, "Deal Aberto");
    const wonDeal = await createDeal(owner.token, wonCustomer.id, "Deal Ganho");

    await request(server)
      .patch(`/deals/${wonDeal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_WON" })
      .expect(200);

    await createTask(owner.token, customer.id);
    const yesterday = new Date(Date.now() - 86_400_000)
      .toISOString()
      .slice(0, 10);
    await createTask(owner.token, customer.id, { dueDate: yesterday });
    await createInteraction(owner.token, customer.id);

    const response = await request(server)
      .get("/dashboard/summary")
      .set(auth(owner.token))
      .expect(200);

    expect(response.body.customers.total).toBe(2);
    expect(response.body.customers.byStatus.LEAD).toBe(2);
    expect(response.body.deals.total).toBe(2);
    expect(response.body.deals.byStage[deal.stage]).toBe(1);
    expect(response.body.deals.byStage.CLOSED_WON).toBe(1);
    expect(response.body.deals.valueByStage[deal.stage]).toBe(1000);
    expect(response.body.deals.valueByStage.CLOSED_WON).toBe(1000);
    expect(response.body.deals.pipelineValue).toBe(1000);
    expect(response.body.deals.wonValue).toBe(1000);
    expect(response.body.tasks.pending).toBe(2);
    expect(response.body.tasks.overdue).toBe(1);
    expect(response.body.interactions.total).toBe(1);
    expect(response.body.interactions.last30Days).toBe(1);
  });

  it("returns dashboard activity and weekly trend", async () => {
    const owner = await register();
    const customer = await createCustomer(owner.token, "Cliente Atividade");

    const wonDeal = await createDeal(owner.token, customer.id, "Deal Ganho");
    await request(server)
      .patch(`/deals/${wonDeal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_WON" })
      .expect(200);

    const lostDeal = await createDeal(owner.token, customer.id, "Deal Perdido");
    await request(server)
      .patch(`/deals/${lostDeal.id}/stage`)
      .set(auth(owner.token))
      .send({ stage: "CLOSED_LOST", lostReason: "Preço" })
      .expect(200);

    await createInteraction(owner.token, customer.id, {
      subject: "Ligação de retorno",
      description: "Cliente pediu proposta revisada",
    });

    const activity = await request(server)
      .get("/dashboard/activity")
      .query({ limit: 5 })
      .set(auth(owner.token))
      .expect(200);
    expect(activity.body).toHaveLength(1);
    expect(activity.body[0].customer.companyName).toBe("Cliente Atividade");
    expect(activity.body[0].user.firstName).toBe("Owner");

    const trend = await request(server)
      .get("/dashboard/trend")
      .query({ weeks: 4 })
      .set(auth(owner.token))
      .expect(200);
    expect(trend.body).toHaveLength(4);
    expect(trend.body[3].won).toBe(1000);
    expect(trend.body[3].lost).toBe(1000);
  });

  it("scopes the dashboard by owner", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    const sales = await createSalesUser(me.body.organizationId);
    const salesToken = await login("sales@example.com", "Senha123!");
    const ownerCustomer = await createCustomer(owner.token, "Cliente Owner");
    await createDeal(owner.token, ownerCustomer.id, "Deal Owner");
    await createTask(owner.token, ownerCustomer.id);
    await createInteraction(owner.token, ownerCustomer.id);

    const empty = await request(server)
      .get("/dashboard/summary")
      .set(auth(salesToken))
      .expect(200);
    expect(empty.body.customers.total).toBe(0);
    expect(empty.body.deals.total).toBe(0);
    expect(empty.body.tasks.pending).toBe(0);
    expect(empty.body.interactions.total).toBe(0);

    const salesCustomer = await createCustomer(salesToken, "Cliente Sales");
    await createTask(salesToken, salesCustomer.id);
    await createInteraction(salesToken, salesCustomer.id);

    const own = await request(server)
      .get("/dashboard/summary")
      .set(auth(salesToken))
      .expect(200);
    expect(own.body.customers.total).toBe(1);
    expect(own.body.tasks.pending).toBe(1);
    expect(own.body.interactions.total).toBe(1);
    expect(own.body.deals.total).toBe(0);
    expect(own.body.deals.pipelineValue).toBe(0);
    expect(sales.id).toBeDefined();
  });

  it("manages organization users and enforces limits", async () => {
    const owner = await register();
    const me = await request(server)
      .get("/users/me")
      .set(auth(owner.token))
      .expect(200);

    const initial = await request(server)
      .get("/users")
      .set(auth(owner.token))
      .expect(200);
    expect(initial.body).toHaveLength(1);

    await request(server)
      .post("/users")
      .set(auth(owner.token))
      .send({
        email: "new-user@example.com",
        password: "Senha123!",
        firstName: "New",
        lastName: "User",
        role: "SALES",
      })
      .expect(400);

    await dataSource
      .getRepository(Organization)
      .update({ id: me.body.organizationId }, { maxUsers: 10 });

    const created = await request(server)
      .post("/users")
      .set(auth(owner.token))
      .send({
        email: "new-user@example.com",
        password: "Senha123!",
        firstName: "New",
        lastName: "User",
        role: "SALES",
      })
      .expect(201);
    expect(created.body.password).toBeUndefined();
    expect(created.body.email).toBe("new-user@example.com");

    const salesToken = await login("new-user@example.com", "Senha123!");

    await request(server).get("/users").set(auth(salesToken)).expect(403);

    await request(server)
      .post("/users")
      .set(auth(salesToken))
      .send({
        email: "blocked@example.com",
        password: "Senha123!",
        firstName: "Blocked",
        lastName: "User",
        role: "SALES",
      })
      .expect(403);

    const updated = await request(server)
      .patch(`/users/${created.body.id}`)
      .set(auth(owner.token))
      .send({ role: "MANAGER" })
      .expect(200);
    expect(updated.body.role).toBe("MANAGER");

    await request(server)
      .patch(`/users/${me.body.id}`)
      .set(auth(owner.token))
      .send({ isActive: false })
      .expect(400);

    await request(server)
      .patch(`/users/${me.body.id}`)
      .set(auth(owner.token))
      .send({ role: "ADMIN" })
      .expect(400);
  });
});
