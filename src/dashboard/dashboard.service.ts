import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOptionsWhere, LessThan, Repository } from "typeorm";
import { hasFullAccess, TenantContext } from "src/common/utils/tenant-context";
import { Customer, CustomerStatus } from "src/entity/Customer";
import { Deal, DealStage } from "src/entity/Deal";
import { Interaction } from "src/entity/Interaction";
import { Task, TaskStatus } from "src/entity/Task";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";
import { DashboardActivityItemDto } from "./dto/dashboard-activity.dto";
import { DashboardTrendPointDto } from "./dto/dashboard-trend.dto";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function numberValue(value: unknown): number {
  return Number(value ?? 0);
}

function startOfWeek(value: Date): Date {
  const date = new Date(value);
  const day = date.getDay();
  const diff = (day + 6) % 7;
  date.setDate(date.getDate() - diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function dateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
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
      dealValues,
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
      Promise.all(
        dealStages.map((stage) =>
          this.dealRepo
            .createQueryBuilder("deal")
            .select("COALESCE(SUM(deal.value), 0)", "total")
            .where("deal.organizationId = :organizationId", {
              organizationId: ctx.organizationId,
            })
            .andWhere("deal.stage = :stage", { stage })
            .andWhere(
              hasFullAccess(ctx.role) ? "1 = 1" : "deal.ownerId = :ownerId",
              hasFullAccess(ctx.role) ? {} : { ownerId: ctx.ownerId },
            )
            .getRawOne<{ total: string }>(),
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
          dueDate: LessThan(today()),
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
        valueByStage: Object.fromEntries(
          dealStages.map((stage, index) => [
            stage,
            numberValue(dealValues[index]?.total),
          ]),
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

  async activity(
    ctx: TenantContext,
    limit = 10,
  ): Promise<DashboardActivityItemDto[]> {
    const query = this.interactionRepo
      .createQueryBuilder("interaction")
      .innerJoinAndSelect("interaction.customer", "customer")
      .leftJoinAndSelect("interaction.user", "user")
      .where("interaction.organizationId = :organizationId", {
        organizationId: ctx.organizationId,
      })
      .orderBy("interaction.createdAt", "DESC")
      .take(Math.min(Math.max(limit, 1), 50));

    if (!hasFullAccess(ctx.role)) {
      query.andWhere("customer.ownerId = :ownerId", {
        ownerId: ctx.ownerId,
      });
    }

    const items = await query.getMany();
    return items.map((item) => ({
      id: item.id,
      type: item.type,
      subject: item.subject ?? null,
      description: item.description,
      createdAt: item.createdAt,
      customer: {
        id: item.customer.id,
        companyName: item.customer.companyName,
      },
      user: item.user
        ? {
            id: item.user.id,
            firstName: item.user.firstName,
            lastName: item.user.lastName,
          }
        : null,
    }));
  }

  async trend(
    ctx: TenantContext,
    weeks = 8,
  ): Promise<DashboardTrendPointDto[]> {
    const safeWeeks = Math.min(Math.max(weeks, 1), 26);
    const currentWeek = startOfWeek(new Date());
    const from = new Date(currentWeek);
    from.setDate(from.getDate() - (safeWeeks - 1) * 7);

    const query = this.dealRepo
      .createQueryBuilder("deal")
      .where("deal.organizationId = :organizationId", {
        organizationId: ctx.organizationId,
      })
      .andWhere("deal.stage IN (:...stages)", {
        stages: [DealStage.CLOSED_WON, DealStage.CLOSED_LOST],
      })
      .andWhere("deal.closedAt >= :from", { from });

    if (!hasFullAccess(ctx.role)) {
      query.andWhere("deal.ownerId = :ownerId", {
        ownerId: ctx.ownerId,
      });
    }

    const deals = await query.getMany();
    const buckets = new Map<string, { won: number; lost: number }>();

    for (const deal of deals) {
      if (!deal.closedAt) continue;
      const key = dateKey(startOfWeek(deal.closedAt));
      const bucket = buckets.get(key) ?? { won: 0, lost: 0 };
      if (deal.stage === DealStage.CLOSED_WON) {
        bucket.won += Number(deal.value);
      } else {
        bucket.lost += Number(deal.value);
      }
      buckets.set(key, bucket);
    }

    return Array.from({ length: safeWeeks }, (_, index) => {
      const weekStart = new Date(from);
      weekStart.setDate(from.getDate() + index * 7);
      const bucket = buckets.get(dateKey(weekStart)) ?? { won: 0, lost: 0 };
      return {
        weekStart: dateKey(weekStart),
        won: bucket.won,
        lost: bucket.lost,
      };
    });
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
