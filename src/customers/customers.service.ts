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
import { QueryFailedError, Repository } from "typeorm";
import { CustomerResponseDto } from "./dto/customer-response.dto";
import { isUUID } from "class-validator";
import { UserRole } from "src/entity/User";

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;
  return (
    typeof driverError === "object" &&
    driverError !== null &&
    "code" in driverError &&
    driverError.code === "23505"
  );
}

type CustomerContext = {
  organizationId: string;
  ownerId: string;
  role: UserRole;
};

const rolesWithFullAcess = [UserRole.ADMIN, UserRole.MANAGER];

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
    { ownerId, organizationId }: CustomerContext,
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
  }: CustomerContext): Promise<CustomerResponseDto[]> {
    const messageMissingToken =
      "Missing required data in token or request body";

    if (!organizationId || !isUUID(organizationId, "4")) {
      throw new UnauthorizedException(messageMissingToken);
    }

    const customers = await this.customerRepo.find({
      where: { organizationId },
    });
    return customers.map((customer) => this.toResponseDto(customer));
  }

  async findOne(
    id: string,
    { ownerId, organizationId, role }: CustomerContext,
  ): Promise<CustomerResponseDto> {
    const message = "Customer not found";
    const messageMissingToken =
      "Missing required data in token or request body";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(messageMissingToken);
    }

    const where = rolesWithFullAcess.includes(role)
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

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  async remove(
    id: string,
    { ownerId, organizationId, role }: CustomerContext,
  ): Promise<void> {
    const message = "Customer not found";

    const where = rolesWithFullAcess.includes(role)
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
