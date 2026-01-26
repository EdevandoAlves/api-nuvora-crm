import { AppDataSource } from "../data-source";
import { CustomerCreateDTO, searchCustomerParamsDTO } from "../dtos/customers.dto";
import { tokenDTO } from "../dtos/organizations.dto";
import { Customer } from "../entity/Customer";
import { DeepPartial } from "typeorm";

export class CustomerService {
  private customerRepo = AppDataSource.getRepository(Customer);

  async createCustomer({
    actor,
    dataBody
  }: {
    actor: tokenDTO
    dataBody: CustomerCreateDTO
  }) {
    if (!["SALES", "MANAGER", "ADMIN", "OWNER"].includes(actor.role)) {
      throw { status: 403, message: "Forbidden" }
    }

    if (!actor.organization) {
      throw { status: 400, message: 'User has no organization' };
    }

    if (dataBody.cnpj) {
      const exists = await this.customerRepo.findOne({
        where: {
          cnpj: dataBody.cnpj,
          organizationId: actor.organization
        }
      });

      if (exists) {
        throw { status: 409, message: 'Customer with this CNPJ already exists' };
      }
    }

    const customer = this.customerRepo.create({
      companyName: dataBody.companyName,
      cnpj: dataBody.cnpj,
      industry: dataBody.industry,
      website: dataBody.website,
      status: dataBody.status ?? 'LEAD',
      source: dataBody.source,
      address: dataBody.address,
      ownerId: actor.id,
      organizationId: actor.organization
    } as DeepPartial<Customer>);

    await this.customerRepo.save(customer);

    return {
      id: customer.id,
      companyName: customer.companyName,
      status: customer.status,
      ownerId: customer.ownerId,
      createdAt: customer.createdAt
    };
  }

  async listCustomers({
    actor,
    queryFilters,
    pagination
  }: {
    actor: tokenDTO
    queryFilters?: { status?: string; industry?: string }
    pagination?: { page?: number; limit?: number }
  }) {
    if (!["SALES", "MANAGER", "ADMIN", "OWNER"].includes(actor.role)) {
      throw { status: 403, message: "Forbidden" }
    }

    const page =
      pagination?.page && pagination.page > 0 ? pagination.page : 1
    const limit =
      pagination?.limit && pagination.limit > 0 && pagination.limit <= 100
        ? pagination.limit
        : 20
    const skip = (page - 1) * limit

    const qb = this.customerRepo
      .createQueryBuilder('customer');

    if (actor.role === 'SALES') {
      qb.where('customer.ownerId = :userId', {
        userId: actor.id
      })
    } else {
      qb.where('customer.organizationId = :orgId', {
        orgId: actor.organization
      })
    }

    if (queryFilters?.status) {
      qb.andWhere('customer.status = :status', {
        status: queryFilters.status
      })
    }

    if (queryFilters?.industry) {
      qb.andWhere('customer.industry = :industry', {
        industry: queryFilters.industry
      })
    }

    const total = await qb.getCount();

    qb
      .orderBy('customer.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    const customers = await qb.getMany();

    return {
      customers,
      total
    }
  }

  async searchCustomers({
    actor,
    queryFilters
  }: {
    actor: tokenDTO
    queryFilters: searchCustomerParamsDTO
  }) {
    if (!queryFilters.q) {
      throw { status: 400, message: 'Search query is required' }
    }

    const qb = this.customerRepo.createQueryBuilder('customer');

    if (actor.role === 'SALES') {
      qb.where('customer.ownerId = :userId', {
        userId: actor.id
      })
    } else {
      qb.where('customer.organizationId = :orgId', {
        orgId: actor.organization
      })
    }

    qb
      .addSelect(
        `
    CASE
      WHEN customer.companyName ILIKE :exact THEN 3
      WHEN customer.website ILIKE :exact THEN 2
      WHEN customer.cnpj ILIKE :exact THEN 1
      ELSE 0
    END
    `,
        'relevance'
      )
      .andWhere(
        `
    customer.companyName ILIKE :q
    OR customer.cnpj ILIKE :q
    OR customer.website ILIKE :q
    `
      )
      .setParameters({
        q: `%${queryFilters.q}%`,
        exact: `${queryFilters.q}%`
      })
      .orderBy('relevance', 'DESC')
      .limit(20);

    const customers = await qb.getMany();

    return customers;
  }
}
