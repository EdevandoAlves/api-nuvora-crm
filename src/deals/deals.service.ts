import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateDealDto } from "./dto/create-deal.dto";
import { UpdateDealDto } from "./dto/update-deal.dto";
import { TenantContext } from "src/common/utils/tenant-context";
import { Customer } from "src/entity/Customer";
import { Repository } from "typeorm";
import { Deal, DealStage } from "src/entity/Deal";
import { DealResponseDto } from "./dto/deal-response.dto";

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
  ) {}

  private toResponseDto(deal: Deal): DealResponseDto {
    return {
      id: deal.id,
      organizationId: deal.organizationId,
      customerId: deal.customerId,
      ownerId: deal.ownerId,
      title: deal.title,
      value: Number(deal.value),
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate ?? null,
      lostReason: deal.lostReason ?? null,
      closedAt: deal.closedAt ?? null,
      createdAt: deal.createdAt,
      updatedAt: deal.updatedAt,
    };
  }

  async create(
    createDealDto: CreateDealDto,
    { ownerId, organizationId }: TenantContext,
  ): Promise<DealResponseDto> {
    const message = "Customer not found";
    const invalidMessage = "Invalid credentials";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(invalidMessage);
    }

    const customer = await this.customerRepo.findOne({
      where: {
        id: createDealDto.customerId,
        organizationId,
      },
    });

    if (!customer) {
      throw new NotFoundException(message);
    }

    const deal = this.dealRepo.create({
      organizationId,
      customerId: createDealDto.customerId,
      ownerId,
      title: createDealDto.title,
      value: createDealDto.value,
      stage: createDealDto.stage ?? DealStage.QUALIFICATION,
      probability: createDealDto.probability ?? 0,
      expectedCloseDate: createDealDto.expectedCloseDate
        ? new Date(createDealDto.expectedCloseDate)
        : undefined,
      lostReason: createDealDto.lostReason,
    });

    await this.dealRepo.save(deal);

    return this.toResponseDto(deal);
  }

  findAll() {
    return `This action returns all deals`;
  }

  findOne(id: number) {
    return `This action returns a #${id} deal`;
  }

  update(id: number, updateDealDto: UpdateDealDto) {
    return `This action updates a #${id} deal`;
  }

  remove(id: number) {
    return `This action removes a #${id} deal`;
  }
}
