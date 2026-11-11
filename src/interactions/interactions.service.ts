import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
  Between,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { hasFullAccess, TenantContext } from "src/common/utils/tenant-context";
import { Contact } from "src/entity/Contact";
import { Customer } from "src/entity/Customer";
import { Interaction } from "src/entity/Interaction";
import { CreateInteractionDto } from "./dto/create-interaction.dto";
import { InteractionResponseDto } from "./dto/interaction-response.dto";
import { PaginatedInteractionResponseDto } from "./dto/paginated-interaction-response.dto";
import { QueryInteractionDto } from "./dto/query-interaction.dto";
import { UpdateInteractionDto } from "./dto/update-interaction.dto";

function endOfDay(value: string): Date {
  return value.length === 10
    ? new Date(`${value}T23:59:59.999Z`)
    : new Date(value);
}

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  private async requireCustomer(
    customerId: string,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<Customer> {
    const where = hasFullAccess(role)
      ? { id: customerId, organizationId }
      : { id: customerId, organizationId, ownerId };

    const customer = await this.customerRepo.findOne({ where });
    if (!customer) {
      throw new NotFoundException("Customer not found");
    }
    return customer;
  }

  private async requireContact(
    customer: Customer,
    contactId: string,
  ): Promise<Contact> {
    const contact = await this.contactRepo.findOne({
      where: {
        id: contactId,
        customerId: customer.id,
        organizationId: customer.organizationId,
      },
    });
    if (!contact) {
      throw new NotFoundException("Contact not found");
    }
    return contact;
  }

  private async requireInteraction(
    customer: Customer,
    interactionId: string,
  ): Promise<Interaction> {
    const interaction = await this.interactionRepo.findOne({
      where: {
        id: interactionId,
        customerId: customer.id,
        organizationId: customer.organizationId,
      },
    });
    if (!interaction) {
      throw new NotFoundException("Interaction not found");
    }
    return interaction;
  }

  private toResponseDto(interaction: Interaction): InteractionResponseDto {
    return {
      id: interaction.id,
      organizationId: interaction.organizationId,
      customerId: interaction.customerId,
      contactId: interaction.contactId ?? null,
      userId: interaction.userId,
      type: interaction.type,
      subject: interaction.subject ?? null,
      description: interaction.description,
      duration: interaction.duration ?? null,
      scheduledAt: interaction.scheduledAt ?? null,
      completedAt: interaction.completedAt ?? null,
      createdAt: interaction.createdAt,
      updatedAt: interaction.updatedAt,
    };
  }

  async create(
    customerId: string,
    dto: CreateInteractionDto,
    userId: string,
    ctx: TenantContext,
  ): Promise<InteractionResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    if (dto.contactId) {
      await this.requireContact(customer, dto.contactId);
    }

    const interaction = this.interactionRepo.create({
      organizationId: customer.organizationId,
      customerId: customer.id,
      contactId: dto.contactId,
      userId,
      type: dto.type,
      subject: dto.subject,
      description: dto.description,
      duration: dto.duration,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
    });

    await this.interactionRepo.save(interaction);
    return this.toResponseDto(interaction);
  }

  async findAll(
    customerId: string,
    query: QueryInteractionDto,
    ctx: TenantContext,
  ): Promise<PaginatedInteractionResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    const where: FindOptionsWhere<Interaction> = {
      organizationId: customer.organizationId,
      customerId: customer.id,
    };

    if (query.type) where.type = query.type;
    if (query.contactId) where.contactId = query.contactId;
    if (query.userId) where.userId = query.userId;

    if (query.startDate && query.endDate) {
      where.createdAt = Between(
        new Date(query.startDate),
        endOfDay(query.endDate),
      );
    } else if (query.startDate) {
      where.createdAt = MoreThanOrEqual(new Date(query.startDate));
    } else if (query.endDate) {
      where.createdAt = LessThanOrEqual(endOfDay(query.endDate));
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [interactions, total] = await this.interactionRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: query.sortOrder ?? "DESC" },
    });

    return {
      data: interactions.map((interaction) => this.toResponseDto(interaction)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    customerId: string,
    interactionId: string,
    ctx: TenantContext,
  ): Promise<InteractionResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    const interaction = await this.requireInteraction(customer, interactionId);
    return this.toResponseDto(interaction);
  }

  async update(
    customerId: string,
    interactionId: string,
    dto: UpdateInteractionDto,
    ctx: TenantContext,
  ): Promise<InteractionResponseDto> {
    const customer = await this.requireCustomer(customerId, ctx);
    const interaction = await this.requireInteraction(customer, interactionId);

    if (dto.contactId !== undefined) {
      await this.requireContact(customer, dto.contactId);
      interaction.contactId = dto.contactId;
    }
    if (dto.type !== undefined) interaction.type = dto.type;
    if (dto.subject !== undefined) interaction.subject = dto.subject;
    if (dto.description !== undefined) {
      interaction.description = dto.description;
    }
    if (dto.duration !== undefined) interaction.duration = dto.duration;
    if (dto.scheduledAt !== undefined) {
      interaction.scheduledAt = new Date(dto.scheduledAt);
    }
    if (dto.completedAt !== undefined) {
      interaction.completedAt = new Date(dto.completedAt);
    }

    await this.interactionRepo.save(interaction);
    return this.toResponseDto(interaction);
  }

  async remove(
    customerId: string,
    interactionId: string,
    ctx: TenantContext,
  ): Promise<void> {
    const customer = await this.requireCustomer(customerId, ctx);
    const interaction = await this.requireInteraction(customer, interactionId);
    await this.interactionRepo.remove(interaction);
  }
}
