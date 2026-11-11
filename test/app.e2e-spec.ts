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
});
