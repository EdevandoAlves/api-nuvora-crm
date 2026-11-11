import { Controller, Get, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";
import { DashboardSummaryDto } from "./dto/dashboard-summary.dto";

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
}
