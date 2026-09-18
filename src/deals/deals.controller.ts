import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { DealsService } from "./deals.service";
import { CreateDealDto } from "./dto/create-deal.dto";
import { UpdateDealDto } from "./dto/update-deal.dto";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { QueryDealDTO } from "./dto/query-deal-dto";
import { DealResponseDto } from "./dto/deal-response.dto";
import { PaginatedDealResponseDTO } from "./dto/paginated-deal-response.dto";

@ApiTags("Deals")
@ApiBearerAuth()
@Controller("deals")
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Post()
  @ApiOperation({ summary: "Create a deal for an existing customer" })
  @ApiOkResponse({ type: DealResponseDto })
  create(
    @Body() createDealDto: CreateDealDto,
    @Req() request: AuthRequest,
  ): Promise<DealResponseDto> {
    return this.dealsService.create(createDealDto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get()
  @ApiOperation({
    summary: "List deals with pagination, filters and sorting",
  })
  @ApiOkResponse({ type: PaginatedDealResponseDTO })
  findAll(
    @Query() query: QueryDealDTO,
    @Req() request: AuthRequest,
  ): Promise<PaginatedDealResponseDTO> {
    return this.dealsService.findAll(
      {
        ownerId: request.user!.id,
        organizationId: request.user!.organization,
        role: request.user!.role,
      },
      query,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a deal by id" })
  @ApiParam({ name: "id", format: "uuid" })
  findOne(@Param("id") id: string) {
    return this.dealsService.findOne(+id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a deal" })
  @ApiParam({ name: "id", format: "uuid" })
  update(@Param("id") id: string, @Body() updateDealDto: UpdateDealDto) {
    return this.dealsService.update(+id, updateDealDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a deal" })
  @ApiParam({ name: "id", format: "uuid" })
  remove(@Param("id") id: string) {
    return this.dealsService.remove(+id);
  }
}
