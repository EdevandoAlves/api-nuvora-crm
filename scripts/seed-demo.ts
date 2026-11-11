import "reflect-metadata";
import * as bcrypt from "bcrypt";
import dataSource from "../src/data-source";
import { Contact } from "../src/entity/Contact";
import { Customer, CustomerStatus } from "../src/entity/Customer";
import { Deal, DealStage } from "../src/entity/Deal";
import { Interaction, InteractionType } from "../src/entity/Interaction";
import { Organization } from "../src/entity/Organization";
import { Product } from "../src/entity/Product";
import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "../src/entity/Task";
import { User, UserRole } from "../src/entity/User";

const DEMO_CNPJ = "98765432109876";
const DEMO_PASSWORD = "Demo1234!";

function dateKey(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

async function main() {
  await dataSource.initialize();
  const orgRepo = dataSource.getRepository(Organization);
  const existing = await orgRepo.findOneBy({ cnpj: DEMO_CNPJ });

  if (existing) {
    console.log("A organização de demonstração já existe. Nada foi alterado.");
    await dataSource.destroy();
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  await dataSource.transaction(async (manager) => {
    const org = manager.create(Organization, {
      name: "Nuvora Demo",
      slug: "nuvora-demo",
      cnpj: DEMO_CNPJ,
      maxUsers: 10,
    });
    await manager.save(org);

    const owner = manager.create(User, {
      organizationId: org.id,
      email: "demo@nuvora.local",
      password: passwordHash,
      firstName: "Marina",
      lastName: "Costa",
      role: UserRole.OWNER,
      isActive: true,
    });
    await manager.save(owner);
    org.ownerId = owner.id;
    await manager.save(org);

    const sales = manager.create(User, {
      organizationId: org.id,
      email: "ana@nuvora.local",
      password: passwordHash,
      firstName: "Ana",
      lastName: "Vendas",
      role: UserRole.SALES,
      isActive: true,
    });
    const managerUser = manager.create(User, {
      organizationId: org.id,
      email: "rafael@nuvora.local",
      password: passwordHash,
      firstName: "Rafael",
      lastName: "Manager",
      role: UserRole.MANAGER,
      isActive: true,
    });
    await manager.save([sales, managerUser]);

    const customerSeeds = [
      {
        companyName: "Atlas Log",
        cnpj: "11222333000101",
        industry: "Logística",
        website: "https://atlaslog.example",
        employeeCount: 120,
        annualRevenue: 12_500_000,
        source: "Indicação",
        status: CustomerStatus.PROSPECT,
      },
      {
        companyName: "Norte Engenharia",
        cnpj: "11222333000102",
        industry: "Engenharia",
        website: "https://norte.example",
        employeeCount: 80,
        annualRevenue: 8_400_000,
        source: "Inbound",
        status: CustomerStatus.PROSPECT,
      },
      {
        companyName: "Cais Digital",
        cnpj: "11222333000103",
        industry: "Tecnologia",
        website: "https://cais.example",
        employeeCount: 45,
        annualRevenue: 4_200_000,
        source: "Evento",
        status: CustomerStatus.CUSTOMER,
      },
      {
        companyName: "Aurora Foods",
        cnpj: "11222333000104",
        industry: "Alimentos",
        website: "https://aurora.example",
        employeeCount: 200,
        annualRevenue: 25_000_000,
        source: "Outbound",
        status: CustomerStatus.LEAD,
      },
      {
        companyName: "Vértice Saúde",
        cnpj: "11222333000105",
        industry: "Saúde",
        website: "https://vertice.example",
        employeeCount: 60,
        annualRevenue: 6_800_000,
        source: "Indicação",
        status: CustomerStatus.CUSTOMER,
      },
      {
        companyName: "Horizonte",
        cnpj: "11222333000106",
        industry: "Varejo",
        website: "https://horizonte.example",
        employeeCount: 30,
        annualRevenue: 2_100_000,
        source: "Inbound",
        status: CustomerStatus.CHURNED,
      },
    ];

    const customers = customerSeeds.map((seed) =>
      manager.create(Customer, {
        ...seed,
        organizationId: org.id,
        ownerId: owner.id,
      }),
    );
    await manager.save(customers);
    const [atlas, norte, cais, aurora, vertice, horizonte] = customers;

    const contactSeeds = [
      manager.create(Contact, {
        organizationId: org.id,
        customerId: atlas.id,
        firstName: "Marina",
        lastName: "Silva",
        email: "marina.silva@atlas.example",
        position: "Compras",
        isPrimary: true,
      }),
      manager.create(Contact, {
        organizationId: org.id,
        customerId: atlas.id,
        firstName: "João",
        lastName: "Pereira",
        email: "joao.pereira@atlas.example",
        position: "TI",
        isPrimary: false,
      }),
      manager.create(Contact, {
        organizationId: org.id,
        customerId: norte.id,
        firstName: "Carla",
        lastName: "Mendes",
        email: "carla.mendes@norte.example",
        position: "Diretora",
        isPrimary: true,
      }),
      manager.create(Contact, {
        organizationId: org.id,
        customerId: cais.id,
        firstName: "Bruno",
        lastName: "Rocha",
        email: "bruno.rocha@cais.example",
        position: "CTO",
        isPrimary: true,
      }),
      manager.create(Contact, {
        organizationId: org.id,
        customerId: aurora.id,
        firstName: "Luiza",
        lastName: "Prado",
        email: "luiza.prado@aurora.example",
        position: "Suprimentos",
        isPrimary: true,
      }),
      manager.create(Contact, {
        organizationId: org.id,
        customerId: vertice.id,
        firstName: "Renata",
        lastName: "Alves",
        email: "renata.alves@vertice.example",
        position: "Diretora",
        isPrimary: true,
      }),
      manager.create(Contact, {
        organizationId: org.id,
        customerId: horizonte.id,
        firstName: "Pedro",
        lastName: "Lima",
        email: "pedro.lima@horizonte.example",
        position: "Compras",
        isPrimary: true,
      }),
    ];
    await manager.save(contactSeeds);

    const deals = [
      manager.create(Deal, {
        organizationId: org.id,
        customerId: atlas.id,
        ownerId: owner.id,
        title: "Expansão de licenças",
        value: 84_000,
        stage: DealStage.PROPOSAL,
        probability: 40,
        expectedCloseDate: new Date(`${dateKey(30)}T12:00:00`),
      }),
      manager.create(Deal, {
        organizationId: org.id,
        customerId: norte.id,
        ownerId: owner.id,
        title: "Integração ERP",
        value: 120_000,
        stage: DealStage.PROPOSAL,
        probability: 45,
        expectedCloseDate: new Date(`${dateKey(45)}T12:00:00`),
      }),
      manager.create(Deal, {
        organizationId: org.id,
        customerId: cais.id,
        ownerId: owner.id,
        title: "Migração de dados",
        value: 58_000,
        stage: DealStage.NEGOTIATION,
        probability: 65,
        expectedCloseDate: new Date(`${dateKey(20)}T12:00:00`),
      }),
      manager.create(Deal, {
        organizationId: org.id,
        customerId: vertice.id,
        ownerId: owner.id,
        title: "Renovação anual",
        value: 96_000,
        stage: DealStage.CLOSED_WON,
        probability: 100,
        closedAt: new Date(),
      }),
      manager.create(Deal, {
        organizationId: org.id,
        customerId: aurora.id,
        ownerId: owner.id,
        title: "Implantação fiscal",
        value: 72_000,
        stage: DealStage.QUALIFICATION,
        probability: 20,
        expectedCloseDate: new Date(`${dateKey(60)}T12:00:00`),
      }),
      manager.create(Deal, {
        organizationId: org.id,
        customerId: horizonte.id,
        ownerId: owner.id,
        title: "Novo CRM",
        value: 64_000,
        stage: DealStage.CLOSED_LOST,
        probability: 0,
        lostReason: "Preço",
        closedAt: new Date(),
      }),
    ];
    await manager.save(deals);

    const tasks = [
      manager.create(Task, {
        organizationId: org.id,
        userId: owner.id,
        customerId: atlas.id,
        dealId: deals[0].id,
        title: "Ligar para Marina sobre expansão",
        description: "Retomar a conversa sobre licenças adicionais.",
        type: TaskType.CALL,
        priority: TaskPriority.HIGH,
        dueDate: dateKey(0),
        status: TaskStatus.PENDING,
      }),
      manager.create(Task, {
        organizationId: org.id,
        userId: owner.id,
        customerId: norte.id,
        dealId: deals[1].id,
        title: "Enviar proposta revisada",
        description: "Enviar a proposta com o escopo ajustado.",
        type: TaskType.EMAIL,
        priority: TaskPriority.HIGH,
        dueDate: dateKey(0),
        status: TaskStatus.PENDING,
      }),
      manager.create(Task, {
        organizationId: org.id,
        userId: owner.id,
        customerId: cais.id,
        dealId: deals[2].id,
        title: "Follow-up do contrato",
        description: "Confirmar a assinatura do contrato.",
        type: TaskType.FOLLOW_UP,
        priority: TaskPriority.MEDIUM,
        dueDate: dateKey(0),
        status: TaskStatus.PENDING,
      }),
      manager.create(Task, {
        organizationId: org.id,
        userId: owner.id,
        customerId: aurora.id,
        dealId: deals[4].id,
        title: "Preparar demo do módulo fiscal",
        description: "Montar o roteiro da demonstração.",
        type: TaskType.DEMO,
        priority: TaskPriority.MEDIUM,
        dueDate: dateKey(1),
        status: TaskStatus.PENDING,
      }),
      manager.create(Task, {
        organizationId: org.id,
        userId: owner.id,
        customerId: vertice.id,
        dealId: deals[3].id,
        title: "Revisar renovação anual",
        description: "Conferir condições da renovação.",
        type: TaskType.CALL,
        priority: TaskPriority.LOW,
        dueDate: dateKey(1),
        status: TaskStatus.PENDING,
      }),
      manager.create(Task, {
        organizationId: org.id,
        userId: owner.id,
        customerId: horizonte.id,
        dealId: deals[5].id,
        title: "Retomar conversa sobre preço",
        description: "Avaliar uma alternativa para o orçamento.",
        type: TaskType.EMAIL,
        priority: TaskPriority.LOW,
        dueDate: dateKey(2),
        status: TaskStatus.PENDING,
      }),
    ];
    await manager.save(tasks);

    const interactions = [
      manager.create(Interaction, {
        organizationId: org.id,
        customerId: atlas.id,
        contactId: contactSeeds[0].id,
        userId: owner.id,
        type: InteractionType.CALL,
        subject: "Ligação de retorno",
        description: "Cliente pediu proposta revisada.",
      }),
      manager.create(Interaction, {
        organizationId: org.id,
        customerId: norte.id,
        contactId: contactSeeds[2].id,
        userId: owner.id,
        type: InteractionType.EMAIL,
        subject: "Proposta enviada",
        description: "Proposta comercial enviada para análise.",
      }),
      manager.create(Interaction, {
        organizationId: org.id,
        customerId: cais.id,
        contactId: contactSeeds[3].id,
        userId: owner.id,
        type: InteractionType.MEETING,
        subject: "Reunião de kickoff",
        description: "Alinhamento de escopo e cronograma.",
      }),
      manager.create(Interaction, {
        organizationId: org.id,
        customerId: aurora.id,
        userId: owner.id,
        type: InteractionType.NOTE,
        description: "Preparar demo do módulo fiscal.",
      }),
      manager.create(Interaction, {
        organizationId: org.id,
        customerId: vertice.id,
        userId: owner.id,
        type: InteractionType.WHATSAPP,
        subject: "Confirmação",
        description: "Renovação confirmada pelo cliente.",
      }),
    ];
    await manager.save(interactions);

    const products = [
      manager.create(Product, {
        organizationId: org.id,
        name: "Plano Starter",
        description: "Plano de entrada para times pequenos.",
        price: 99,
        category: "Planos",
      }),
      manager.create(Product, {
        organizationId: org.id,
        name: "Plano Pro",
        description: "Plano para equipes em crescimento.",
        price: 199,
        category: "Planos",
      }),
      manager.create(Product, {
        organizationId: org.id,
        name: "Implantação",
        description: "Setup e migração assistida.",
        price: 1_500,
        category: "Serviços",
      }),
    ];
    await manager.save(products);
  });

  console.log("Organização de demonstração criada.");
  console.log("Owner:   demo@nuvora.local / Demo1234!");
  console.log("Sales:   ana@nuvora.local / Demo1234!");
  console.log("Manager: rafael@nuvora.local / Demo1234!");
  await dataSource.destroy();
}

main().catch(async (error) => {
  console.error(error);
  if (dataSource.isInitialized) await dataSource.destroy();
  process.exitCode = 1;
});
