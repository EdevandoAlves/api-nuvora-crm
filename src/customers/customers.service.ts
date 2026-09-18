import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";
import { Not, Repository } from "typeorm";
import { CustomerResponseDto } from "./dto/customer-response.dto";
import { isUUID } from "class-validator";
import { isUniqueViolation } from "src/common/utils/typeorm-errors";
import {
  ROLES_WITH_FULL_ACCESS,
  TenantContext,
} from "src/common/utils/tenant-context";

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) {}

  private toResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      organizationId: customer.organizationId,
      ownerId: customer.ownerId,
      companyName: customer.companyName,
      cnpj: customer.cnpj,
      industry: customer.industry,
      website: customer.website,
      employeeCount: customer.employeeCount,
      annualRevenue: customer.annualRevenue,
      address: customer.address,
      status: customer.status,
      source: customer.source,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  async create(
    createCustomerDto: CreateCustomerDto,
    { ownerId, organizationId }: TenantContext,
  ): Promise<CustomerResponseDto> {
    const messageMissingToken =
      "Missing required data in token or request body";
    const conflictMessage =
      "A customer with this CNPJ already exists in this organization";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(messageMissingToken);
    }

    if (!createCustomerDto.companyName) {
      throw new UnauthorizedException(messageMissingToken);
    }
    try {
      const customer = this.customerRepo.create({
        organizationId,
        ownerId,
        companyName: createCustomerDto.companyName,
        cnpj: createCustomerDto.cnpj,
        industry: createCustomerDto.industry,
        website: createCustomerDto.website,
        employeeCount: createCustomerDto.employeeCount,
        annualRevenue: createCustomerDto.annualRevenue,
        address: createCustomerDto.address,
        source: createCustomerDto.source,
        status: createCustomerDto.status,
      });

      await this.customerRepo.save(customer);

      return this.toResponseDto(customer);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(conflictMessage);
      }
      throw error;
    }
  }

  async findAll({
    organizationId,
  }: TenantContext): Promise<CustomerResponseDto[]> {
    const messageMissingToken =
      "Missing required data in token or request body";

    if (!organizationId || !isUUID(organizationId, "4")) {
      throw new UnauthorizedException(messageMissingToken);
    }

    const customers = await this.customerRepo.find({
      where: { organizationId },
    });

    if (customers.length === 0) {
      return [];
    }

    return customers.map((customer) => this.toResponseDto(customer));
  }

  async findOne(
    id: string,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<CustomerResponseDto> {
    const message = "Customer not found";
    const messageMissingToken =
      "Missing required data in token or request body";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(messageMissingToken);
    }

    const where = ROLES_WITH_FULL_ACCESS.includes(role)
      ? { id, organizationId }
      : { id, organizationId, ownerId };

    const customer = await this.customerRepo.findOne({
      where,
    });

    if (!customer) {
      throw new NotFoundException(message);
    }

    return this.toResponseDto(customer);
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<CustomerResponseDto> {
    const message = "Customer not found";
    const conflictMessage =
      "A customer with this CNPJ already exists in this organization";

    const where = ROLES_WITH_FULL_ACCESS.includes(role)
      ? { id, organizationId }
      : { id, organizationId, ownerId };

    const customer = await this.customerRepo.findOne({
      where,
    });

    if (!customer) {
      throw new NotFoundException(message);
    }

    if (updateCustomerDto.companyName !== undefined) {
      customer.companyName = updateCustomerDto.companyName;
    }
    if (updateCustomerDto.cnpj !== undefined) {
      const cnpjExisting = await this.customerRepo.findOne({
        where: { cnpj: updateCustomerDto.cnpj, organizationId, id: Not(id) },
      });
      if (cnpjExisting) {
        throw new ConflictException(conflictMessage);
      }
      customer.cnpj = updateCustomerDto.cnpj;
    }
    if (updateCustomerDto.industry !== undefined) {
      customer.industry = updateCustomerDto.industry;
    }
    if (updateCustomerDto.website !== undefined) {
      customer.website = updateCustomerDto.website;
    }
    if (updateCustomerDto.employeeCount !== undefined) {
      customer.employeeCount = updateCustomerDto.employeeCount;
    }
    if (updateCustomerDto.annualRevenue !== undefined) {
      customer.annualRevenue = updateCustomerDto.annualRevenue;
    }
    if (updateCustomerDto.address !== undefined) {
      customer.address = updateCustomerDto.address as Customer["address"];
    }
    if (updateCustomerDto.source !== undefined) {
      customer.source = updateCustomerDto.source;
    }
    if (updateCustomerDto.status !== undefined) {
      customer.status = updateCustomerDto.status;
    }

    try {
      await this.customerRepo.save(customer);

      return this.toResponseDto(customer);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(conflictMessage);
      }
      throw error;
    }
  }

  async remove(
    id: string,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<void> {
    const message = "Customer not found";

    const where = ROLES_WITH_FULL_ACCESS.includes(role)
      ? { id, organizationId }
      : { id, organizationId, ownerId };

    const customer = await this.customerRepo.findOne({
      where,
    });

    if (!customer) {
      throw new NotFoundException(message);
    }

    await this.customerRepo.softRemove(customer);
  }
}
