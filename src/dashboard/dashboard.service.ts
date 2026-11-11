import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, LessThan, Repository } from "typeorm";
import { hasFullAccess, TenantContext } from "src/common/utils/tenant-context";
import { Customer, CustomerStatus } from "src/entity/Customer";
import { Deal, DealStage } from "src/entity/Deal";
import { Interaction } from "src/entity/Interaction";
import { Task, TaskStatus } from "src/entity/Task";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function numberValue(value: unknown): number {
  return Number(value ?? 0);
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Deal)
    private readonly dealRepo: Repository<Deal>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,
  ) {}

  private customerWhere(ctx: TenantContext): FindOptionsWhere<Customer> {
    return hasFullAccess(ctx.role)
      ? { organizationId: ctx.organizationId }
      : { organizationId: ctx.organizationId, ownerId: ctx.ownerId };
  }

  private dealWhere(ctx: TenantContext): FindOptionsWhere<Deal> {
    return hasFullAccess(ctx.role)
      ? { organizationId: ctx.organizationId }
      : { organizationId: ctx.organizationId, ownerId: ctx.ownerId };
  }

  private taskWhere(ctx: TenantContext): FindOptionsWhere<Task> {
    return hasFullAccess(ctx.role)
      ? { organizationId: ctx.organizationId }
      : { organizationId: ctx.organizationId, userId: ctx.ownerId };
  }

  async summary(ctx: TenantContext): Promise<DashboardSummaryDto> {
    const customerBase = this.customerWhere(ctx);
    const dealBase = this.dealWhere(ctx);
    const taskBase = this.taskWhere(ctx);

    const customerStatuses = Object.values(CustomerStatus);
    const dealStages = Object.values(DealStage);

    const [
      customerTotal,
      customerCounts,
      dealTotal,
      dealCounts,
      pipeline,
      won,
      lost,
      taskPending,
      taskCompleted,
      taskCancelled,
      taskOverdue,
      interactionsTotal,
      interactionsLast30Days,
    ] = await Promise.all([
      this.customerRepo.count({ where: customerBase }),
      Promise.all(
        customerStatuses.map((status) =>
          this.customerRepo.count({
            where: { ...customerBase, status },
          }),
        ),
      ),
      this.dealRepo.count({ where: dealBase }),
      Promise.all(
        dealStages.map((stage) =>
          this.dealRepo.count({ where: { ...dealBase, stage } }),
        ),
      ),
      this.dealRepo
        .createQueryBuilder("deal")
        .select("COALESCE(SUM(deal.value), 0)", "total")
        .where("deal.organizationId = :organizationId", {
          organizationId: ctx.organizationId,
        })
        .andWhere("deal.stage NOT IN (:...closed)", {
          closed: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
        })
        .andWhere(
          hasFullAccess(ctx.role) ? "1 = 1" : "deal.ownerId = :ownerId",
          hasFullAccess(ctx.role) ? {} : { ownerId: ctx.ownerId },
        )
        .getRawOne<{ total: string }>(),
      this.dealRepo
        .createQueryBuilder("deal")
        .select("COALESCE(SUM(deal.value), 0)", "total")
        .where("deal.organizationId = :organizationId", {
          organizationId: ctx.organizationId,
        })
        .andWhere("deal.stage = :stage", { stage: DealStage.CLOSED_WON })
        .andWhere(
          hasFullAccess(ctx.role) ? "1 = 1" : "deal.ownerId = :ownerId",
          hasFullAccess(ctx.role) ? {} : { ownerId: ctx.ownerId },
        )
        .getRawOne<{ total: string }>(),
      this.dealRepo
        .createQueryBuilder("deal")
        .select("COALESCE(SUM(deal.value), 0)", "total")
        .where("deal.organizationId = :organizationId", {
          organizationId: ctx.organizationId,
        })
        .andWhere("deal.stage = :stage", { stage: DealStage.CLOSED_LOST })
        .andWhere(
          hasFullAccess(ctx.role) ? "1 = 1" : "deal.ownerId = :ownerId",
          hasFullAccess(ctx.role) ? {} : { ownerId: ctx.ownerId },
        )
        .getRawOne<{ total: string }>(),
      this.taskRepo.count({
        where: { ...taskBase, status: TaskStatus.PENDING },
      }),
      this.taskRepo.count({
        where: { ...taskBase, status: TaskStatus.COMPLETED },
      }),
      this.taskRepo.count({
        where: { ...taskBase, status: TaskStatus.CANCELLED },
      }),
      this.taskRepo.count({
        where: {
          ...taskBase,
          status: TaskStatus.PENDING,
          dueDate: LessThan(new Date(today())),
        },
      }),
      this.interactionQuery(ctx).getCount(),
      this.interactionQuery(ctx)
        .andWhere("interaction.createdAt >= :since", {
          since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        })
        .getCount(),
    ]);

    return {
      customers: {
        total: customerTotal,
        byStatus: Object.fromEntries(
          customerStatuses.map((status, index) => [
            status,
            customerCounts[index],
          ]),
        ),
      },
      deals: {
        total: dealTotal,
        byStage: Object.fromEntries(
          dealStages.map((stage, index) => [stage, dealCounts[index]]),
        ),
        pipelineValue: numberValue(pipeline?.total),
        wonValue: numberValue(won?.total),
        lostValue: numberValue(lost?.total),
      },
      tasks: {
        pending: taskPending,
        completed: taskCompleted,
        cancelled: taskCancelled,
        overdue: taskOverdue,
      },
      interactions: {
        total: interactionsTotal,
        last30Days: interactionsLast30Days,
      },
    };
  }

  private interactionQuery(ctx: TenantContext) {
    const query = this.interactionRepo
      .createQueryBuilder("interaction")
      .innerJoin("interaction.customer", "customer")
      .where("interaction.organizationId = :organizationId", {
        organizationId: ctx.organizationId,
      });

    if (!hasFullAccess(ctx.role)) {
      query.andWhere("customer.ownerId = :ownerId", {
        ownerId: ctx.ownerId,
      });
    }

    return query;
  }
}
