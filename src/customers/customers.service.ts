import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Customer } from "src/entity/Customer";
import { QueryFailedError, Repository } from "typeorm";
import { CustomerResponseDto } from "./dto/customer-response.dto";

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
};

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
  ) { }

  async create(
    createCustomerDto: CreateCustomerDto,
    { ownerId, organizationId }: CustomerContext,
  ) {
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

      const customerResponse = new CustomerResponseDto();
      customerResponse.organizationId = customer.organizationId;
      customerResponse.ownerId = customer.ownerId;
      customerResponse.companyName = customer.companyName;
      customerResponse.cnpj = customer.cnpj;
      customerResponse.industry = customer.industry;
      customerResponse.website = customer.website;
      customerResponse.employeeCount = customer.employeeCount;
      customerResponse.annualRevenue = customer.annualRevenue;
      customerResponse.address = customer.address;
      customerResponse.source = customer.source;

      return customerResponse;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(conflictMessage);
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all customers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} customer`;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
