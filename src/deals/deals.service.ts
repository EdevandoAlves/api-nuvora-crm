import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateDealDto } from "./dto/create-deal.dto";
import { UpdateDealDto } from "./dto/update-deal.dto";
import {
  ROLES_WITH_FULL_ACCESS,
  TenantContext,
} from "src/common/utils/tenant-context";
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
import { UpdateStageDealDto } from "./dto/update-stage-deal.dto";

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
    const unauthorizedMessage = "Unauthorized";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(unauthorizedMessage);
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
    const unauthorizedMessage = "Unauthorized";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(unauthorizedMessage);
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

  async update(
    id: string,
    updateDealDto: UpdateDealDto,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<DealResponseDto> {
    const unauthorizedMessage = "Unauthorized";
    const customerMessage = "Customer not found";
    const message = "Deal not found";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    const where = ROLES_WITH_FULL_ACCESS.includes(role)
      ? { id, organizationId }
      : { id, organizationId, ownerId };

    const deal = await this.dealRepo.findOne({ where });

    if (!deal) {
      throw new NotFoundException(message);
    }

    if (updateDealDto.customerId !== undefined) {
      const customer = await this.customerRepo.findOne({
        where: { id: updateDealDto.customerId, organizationId },
      });
      if (!customer) {
        throw new NotFoundException(customerMessage);
      }
      deal.customerId = updateDealDto.customerId;
    }

    if (updateDealDto.title !== undefined) {
      deal.title = updateDealDto.title;
    }

    if (updateDealDto.value !== undefined) {
      deal.value = updateDealDto.value;
    }

    if (updateDealDto.probability !== undefined) {
      deal.probability = updateDealDto.probability;
    }

    if (updateDealDto.expectedCloseDate !== undefined) {
      deal.expectedCloseDate = new Date(updateDealDto.expectedCloseDate);
    }

    await this.dealRepo.save(deal);

    return this.toResponseDto(deal);
  }

  async updateStage(
    id: string,
    updateStageDealDto: UpdateStageDealDto,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<DealResponseDto> {
    const unauthorizedMessage = "Unauthorized";
    const BadRequestMessage =
      "lostReason is required when stage is CLOSED_LOST";
    const message = "Deal not found";

    if (!ownerId || !organizationId) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    const where = ROLES_WITH_FULL_ACCESS.includes(role)
      ? { id, organizationId }
      : { id, organizationId, ownerId };

    const deal = await this.dealRepo.findOne({ where });

    if (!deal) {
      throw new NotFoundException(message);
    }

    if (
      updateStageDealDto.stage === DealStage.CLOSED_LOST &&
      !updateStageDealDto.lostReason?.trim()
    ) {
      throw new BadRequestException(BadRequestMessage);
    }

    deal.stage = updateStageDealDto.stage;
    if (updateStageDealDto.lostReason !== undefined) {
      deal.lostReason = updateStageDealDto.lostReason;
    }
    deal.closedAt = [DealStage.CLOSED_WON, DealStage.CLOSED_LOST].includes(
      updateStageDealDto.stage,
    )
      ? new Date()
      : null;

    await this.dealRepo.save(deal);

    return this.toResponseDto(deal);
  }
}
