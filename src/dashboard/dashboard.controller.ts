import { Controller, Get, Query, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";
import {
  DashboardActivityItemDto,
  QueryDashboardActivityDto,
} from "./dto/dashboard-activity.dto";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";
import {
  DashboardTrendPointDto,
  QueryDashboardTrendDto,
} from "./dto/dashboard-trend.dto";

@ApiTags("Dashboard")
@ApiBearerAuth()
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("summary")
  @ApiOperation({ summary: "Get the organization dashboard summary" })
  @ApiOkResponse({ type: DashboardSummaryDto })
  summary(@Req() request: AuthRequest): Promise<DashboardSummaryDto> {
    return this.dashboardService.summary({
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get("activity")
  @ApiOperation({ summary: "Get recent customer interactions" })
  @ApiOkResponse({ type: [DashboardActivityItemDto] })
  activity(
    @Query() query: QueryDashboardActivityDto,
    @Req() request: AuthRequest,
  ): Promise<DashboardActivityItemDto[]> {
    return this.dashboardService.activity(
      {
        ownerId: request.user!.id,
        organizationId: request.user!.organization,
        role: request.user!.role,
      },
      query.limit,
    );
  }

  @Get("trend")
  @ApiOperation({ summary: "Get weekly won and lost deal totals" })
  @ApiOkResponse({ type: [DashboardTrendPointDto] })
  trend(
    @Query() query: QueryDashboardTrendDto,
    @Req() request: AuthRequest,
  ): Promise<DashboardTrendPointDto[]> {
    return this.dashboardService.trend(
      {
        ownerId: request.user!.id,
        organizationId: request.user!.organization,
        role: request.user!.role,
      },
      query.weeks,
    );
  }
}
