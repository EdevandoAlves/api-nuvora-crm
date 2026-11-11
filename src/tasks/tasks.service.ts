import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, LessThan, Repository } from "typeorm";
import { hasFullAccess, TenantContext } from "src/common/utils/tenant-context";
import { Customer } from "src/entity/Customer";
import { Deal } from "src/entity/Deal";
import { Task, TaskStatus } from "src/entity/Task";
import { User } from "src/entity/User";
import { CreateTaskDto } from "./dto/create-task.dto";
import { PaginatedTaskResponseDto } from "./dto/paginated-task-response.dto";
import { QueryTaskDto } from "./dto/query-task.dto";
import { TaskResponseDto } from "./dto/task-response.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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

  private async requireDeal(
    dealId: string,
    customerId: string,
    organizationId: string,
  ): Promise<Deal> {
    const deal = await this.dealRepo.findOne({
      where: { id: dealId, customerId, organizationId },
    });
    if (!deal) {
      throw new NotFoundException("Deal not found");
    }
    return deal;
  }

  private async requireAssignee(
    userId: string,
    organizationId: string,
  ): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: userId, organizationId, isActive: true },
    });
    if (!user) {
      throw new NotFoundException("Assignee not found");
    }
    return user;
  }

  private async requireTask(
    id: string,
    { ownerId, organizationId, role }: TenantContext,
  ): Promise<Task> {
    const where = hasFullAccess(role)
      ? { id, organizationId }
      : { id, organizationId, userId: ownerId };

    const task = await this.taskRepo.findOne({ where });
    if (!task) {
      throw new NotFoundException("Task not found");
    }
    return task;
  }

  private toResponseDto(task: Task): TaskResponseDto {
    return {
      id: task.id,
      organizationId: task.organizationId,
      userId: task.userId,
      customerId: task.customerId,
      dealId: task.dealId ?? null,
      title: task.title,
      description: task.description ?? null,
      type: task.type,
      priority: task.priority,
      dueDate: task.dueDate,
      status: task.status,
      completedAt: task.completedAt ?? null,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  async create(
    dto: CreateTaskDto,
    ctx: TenantContext,
  ): Promise<TaskResponseDto> {
    const customer = await this.requireCustomer(dto.customerId, ctx);

    if (!hasFullAccess(ctx.role) && dto.userId && dto.userId !== ctx.ownerId) {
      throw new ForbiddenException("Cannot assign tasks to another user");
    }

    const assigneeId = hasFullAccess(ctx.role)
      ? (dto.userId ?? ctx.ownerId)
      : ctx.ownerId;
    await this.requireAssignee(assigneeId, customer.organizationId);

    if (dto.dealId) {
      await this.requireDeal(dto.dealId, customer.id, customer.organizationId);
    }

    const task = this.taskRepo.create({
      organizationId: customer.organizationId,
      userId: assigneeId,
      customerId: customer.id,
      dealId: dto.dealId,
      title: dto.title,
      description: dto.description,
      type: dto.type,
      priority: dto.priority,
      dueDate: new Date(dto.dueDate),
      status: TaskStatus.PENDING,
    });

    await this.taskRepo.save(task);
    return this.toResponseDto(task);
  }

  async findAll(
    query: QueryTaskDto,
    ctx: TenantContext,
  ): Promise<PaginatedTaskResponseDto> {
    const where: FindOptionsWhere<Task> = {
      organizationId: ctx.organizationId,
    };

    if (!hasFullAccess(ctx.role)) {
      where.userId = ctx.ownerId;
    } else if (query.userId) {
      where.userId = query.userId;
    }

    if (query.status) where.status = query.status;
    if (query.priority) where.priority = query.priority;
    if (query.type) where.type = query.type;
    if (query.customerId) where.customerId = query.customerId;
    if (query.dealId) where.dealId = query.dealId;

    if (query.overdue) {
      where.status = TaskStatus.PENDING;
      where.dueDate = LessThan(new Date(today()));
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [tasks, total] = await this.taskRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [query.sortBy ?? "dueDate"]: query.sortOrder ?? "ASC" },
    });

    return {
      data: tasks.map((task) => this.toResponseDto(task)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, ctx: TenantContext): Promise<TaskResponseDto> {
    const task = await this.requireTask(id, ctx);
    return this.toResponseDto(task);
  }

  async update(
    id: string,
    dto: UpdateTaskDto,
    ctx: TenantContext,
  ): Promise<TaskResponseDto> {
    const task = await this.requireTask(id, ctx);

    if (dto.userId !== undefined) {
      if (!hasFullAccess(ctx.role)) {
        throw new ForbiddenException("Cannot reassign this task");
      }
      await this.requireAssignee(dto.userId, task.organizationId);
      task.userId = dto.userId;
    }

    if (dto.title !== undefined) task.title = dto.title;
    if (dto.description !== undefined) task.description = dto.description;
    if (dto.type !== undefined) task.type = dto.type;
    if (dto.priority !== undefined) task.priority = dto.priority;
    if (dto.dueDate !== undefined) task.dueDate = new Date(dto.dueDate);

    await this.taskRepo.save(task);
    return this.toResponseDto(task);
  }

  async updateStatus(
    id: string,
    dto: UpdateTaskStatusDto,
    ctx: TenantContext,
  ): Promise<TaskResponseDto> {
    const task = await this.requireTask(id, ctx);

    task.status = dto.status;
    task.completedAt =
      dto.status === TaskStatus.COMPLETED
        ? (task.completedAt ?? new Date())
        : null;

    await this.taskRepo.save(task);
    return this.toResponseDto(task);
  }

  async remove(id: string, ctx: TenantContext): Promise<void> {
    const task = await this.requireTask(id, ctx);
    await this.taskRepo.remove(task);
  }
}
