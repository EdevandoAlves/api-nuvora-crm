import { AppDataSource } from './data-source';
import { Organization, PlanType } from './entity/Organization';
import { User, UserRole } from './entity/User';
import { Customer, CustomerStatus } from './entity/Customer';
import { Contact } from './entity/Contact';
import { Deal, DealStage } from './entity/Deal';
import { Product } from './entity/Product';
import { DealProduct } from './entity/DealProduct';
import { Task, TaskPriority, TaskStatus, TaskType } from './entity/Task';
import { Interaction, InteractionType } from './entity/Interaction';
import * as bcrypt from 'bcrypt';

// Number of items to seed
const COUNT = 3;

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connection initialized.');

  // Clean slate
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.query(`TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE;`);
  }
  console.log('All tables truncated.');

  // Repositories
  const orgRepo = AppDataSource.getRepository(Organization);
  const userRepo = AppDataSource.getRepository(User);
  const customerRepo = AppDataSource.getRepository(Customer);
  const contactRepo = AppDataSource.getRepository(Contact);
  const productRepo = AppDataSource.getRepository(Product);
  const dealRepo = AppDataSource.getRepository(Deal);
  const dealProductRepo = AppDataSource.getRepository(DealProduct);
  const taskRepo = AppDataSource.getRepository(Task);
  const interactionRepo = AppDataSource.getRepository(Interaction);

  // 1. Create Organizations
  const orgs = [];
  for (let i = 1; i <= COUNT; i++) {
    orgs.push(orgRepo.create({
      name: `Org ${i}`,
      slug: `org-${i}`,
      plan: PlanType.PRO,
    }));
  }
  await orgRepo.save(orgs);
  console.log(`${orgs.length} organizations created.`);

  // 2. Create Users
  const users = [];
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('password123', salt);

  for (let i = 0; i < orgs.length; i++) {
    for (let j = 1; j <= COUNT; j++) {
        users.push(userRepo.create({
            organization: orgs[i],
            email: `user${i * COUNT + j}@${orgs[i].slug}.com`,
            password: password,
            firstName: `User`,
            lastName: `${i * COUNT + j}`,
            role: j === 1 ? UserRole.OWNER : UserRole.SALES,
        }));
    }
  }
  await userRepo.save(users);
  console.log(`${users.length} users created.`);

  // 3. Create Products
  const products = [];
  for (let i = 1; i <= COUNT; i++) {
    products.push(productRepo.create({
      name: `Product ${i}`,
      price: 100 * i,
      category: 'Software',
    }));
  }
  await productRepo.save(products);
  console.log(`${products.length} products created.`);

  // 4. Create Customers, Contacts, Deals, Tasks, Interactions for each Org
  for (const org of orgs) {
    const orgUsers = users.filter(u => u.organization.id === org.id);

    for (let i = 1; i <= COUNT; i++) {
      // Customer
      const customer = await customerRepo.save(customerRepo.create({
        organization: org,
        owner: orgUsers[i % orgUsers.length],
        companyName: `Customer ${org.id}-${i}`,
        status: CustomerStatus.LEAD,
      }));

      // Contact
      const contact = await contactRepo.save(contactRepo.create({
        organization: org,
        customer: customer,
        firstName: `Contact ${i}`,
        lastName: `Person`,
        email: `contact${i}@customer.com`,
      }));

      // Deal
      const deal = await dealRepo.save(dealRepo.create({
        organization: org,
        customer: customer,
        owner: orgUsers[i % orgUsers.length],
        title: `Deal for ${customer.companyName}`,
        value: 5000 * i,
        stage: DealStage.QUALIFICATION,
      }));

      // DealProduct
      await dealProductRepo.save(dealProductRepo.create({
        deal: deal,
        product: products[i % products.length],
        quantity: i,
        unitPrice: products[i % products.length].price,
        totalPrice: products[i % products.length].price * i,
      }));

      // Task
      await taskRepo.save(taskRepo.create({
        organization: org,
        assignee: orgUsers[i % orgUsers.length],
        customer: customer,
        deal: deal,
        title: `Follow-up with ${customer.companyName}`,
        type: TaskType.FOLLOW_UP,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      }));

      // Interaction
      await interactionRepo.save(interactionRepo.create({
        organization: org,
        customer: customer,
        contact: contact,
        user: orgUsers[i % orgUsers.length],
        type: InteractionType.NOTE,
        description: `Initial note for ${customer.companyName}`,
      }));
    }
  }
  console.log(`Seeded data for ${orgs.length} organizations.`);

  await AppDataSource.destroy();
  console.log('Database connection closed.');
}

seed().catch(error => console.error('Seeding failed:', error));
