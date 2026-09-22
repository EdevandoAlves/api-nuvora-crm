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
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { Deal, DealStage } from "src/entity/Deal";
import { DealResponseDto } from "./dto/deal-response.dto";
import { PaginatedDealResponseDTO } from "./dto/paginated-deal-response.dto";
import { QueryDealDTO } from "./dto/query-deal-dto";

@Injectable()
export class DealsService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,

    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
  ) { }

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

  async findAll(
    { ownerId, organizationId }: TenantContext,
    query: QueryDealDTO,
  ): Promise<PaginatedDealResponseDTO> {
    const invalidMessage = "Invalid credentials";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(invalidMessage);
    }

    const where: FindOptionsWhere<Deal> = { organizationId };

    if (query.stage) {
      where.stage = query.stage;
    }
    if (query.customerId) {
      where.customerId = query.customerId;
    }
    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }
    if (query.startDate && query.endDate) {
      where.createdAt = Between(
        new Date(query.startDate),
        new Date(query.endDate),
      );
    } else if (query.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(query.startDate));
    } else if (query.endDate) {
      where.createdAt = LessThanOrEqual(new Date(query.endDate));
    }

    const sortBy = query.sortBy ?? "createdAt";
    const sortOrder = query.sortOrder ?? "DESC";
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [deals, total] = await this.dealRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      data: deals.map((deal) => this.toResponseDto(deal)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    { ownerId, organizationId }: TenantContext,
  ): Promise<DealResponseDto> {
    const invalidMessage = "Invalid credentials";
    const message = "Deal not found";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(invalidMessage);
    }

    const deal = await this.dealRepo.findOne({ where: { id, organizationId } });

    if (!deal) {
      throw new NotFoundException(message);
    }

    return this.toResponseDto(deal);
  }

  update(id: number, updateDealDto: UpdateDealDto) {
    void updateDealDto;
    return `This action updates a #${id} deal`;
  }

  remove(id: number) {
    return `This action removes a #${id} deal`;
  }
}
