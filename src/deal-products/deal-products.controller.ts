import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { CreateDealProductDto } from "./dto/create-deal-product.dto";
import { DealProductResponseDto } from "./dto/deal-product-response.dto";
import { UpdateDealProductDto } from "./dto/update-deal-product.dto";
import { DealProductsService } from "./deal-products.service";

@ApiTags("Deal Products")
@ApiBearerAuth()
@Controller("deals/:dealId/products")
export class DealProductsController {
  constructor(private readonly dealProductsService: DealProductsService) {}

  @Get()
  @ApiOperation({ summary: "List products on a deal" })
  @ApiParam({ name: "dealId", format: "uuid" })
  @ApiOkResponse({ type: [DealProductResponseDto] })
  findAll(
    @Param("dealId", new ParseUUIDPipe({ version: "4" })) dealId: string,
    @Req() request: AuthRequest,
  ): Promise<DealProductResponseDto[]> {
    return this.dealProductsService.findAll(dealId, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Post()
  @ApiOperation({ summary: "Add a product to a deal" })
  @ApiParam({ name: "dealId", format: "uuid" })
  @ApiOkResponse({ type: DealProductResponseDto })
  create(
    @Param("dealId", new ParseUUIDPipe({ version: "4" })) dealId: string,
    @Body() dto: CreateDealProductDto,
    @Req() request: AuthRequest,
  ): Promise<DealProductResponseDto> {
    return this.dealProductsService.create(dealId, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a product line on a deal" })
  @ApiParam({ name: "dealId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  update(
    @Param("dealId", new ParseUUIDPipe({ version: "4" })) dealId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateDealProductDto,
    @Req() request: AuthRequest,
  ): Promise<DealProductResponseDto> {
    return this.dealProductsService.update(dealId, id, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a product line from a deal" })
  @ApiParam({ name: "dealId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiNoContentResponse({ description: "Deal product removed" })
  remove(
    @Param("dealId", new ParseUUIDPipe({ version: "4" })) dealId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<void> {
    return this.dealProductsService.remove(dealId, id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
