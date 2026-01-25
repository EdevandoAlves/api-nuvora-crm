import { AppDataSource } from "../data-source";
import { CustomerCreateDTO } from "../dtos/customers.dto";
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
}
