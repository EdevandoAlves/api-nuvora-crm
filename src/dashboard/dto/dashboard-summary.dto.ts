import { ApiProperty } from "@nestjs/swagger";

export class DashboardCustomerSummaryDto {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  byStatus: Record<string, number>;
}

export class DashboardDealSummaryDto {
  @ApiProperty()
  total: number;

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  byStage: Record<string, number>;

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  valueByStage: Record<string, number>;

  @ApiProperty()
  pipelineValue: number;

  @ApiProperty()
  wonValue: number;

  @ApiProperty()
  lostValue: number;
}

export class DashboardTaskSummaryDto {
  @ApiProperty()
  pending: number;

  @ApiProperty()
  completed: number;

  @ApiProperty()
  cancelled: number;

  @ApiProperty()
  overdue: number;
}

export class DashboardInteractionSummaryDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  last30Days: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ type: DashboardCustomerSummaryDto })
  customers: DashboardCustomerSummaryDto;

  @ApiProperty({ type: DashboardDealSummaryDto })
  deals: DashboardDealSummaryDto;

  @ApiProperty({ type: DashboardTaskSummaryDto })
  tasks: DashboardTaskSummaryDto;

  @ApiProperty({ type: DashboardInteractionSummaryDto })
  interactions: DashboardInteractionSummaryDto;
}
