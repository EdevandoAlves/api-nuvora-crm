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
  Query,
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
import { CreateInteractionDto } from "./dto/create-interaction.dto";
import { InteractionResponseDto } from "./dto/interaction-response.dto";
import { PaginatedInteractionResponseDto } from "./dto/paginated-interaction-response.dto";
import { QueryInteractionDto } from "./dto/query-interaction.dto";
import { UpdateInteractionDto } from "./dto/update-interaction.dto";
import { InteractionsService } from "./interactions.service";

@ApiTags("Interactions")
@ApiBearerAuth()
@Controller("customers/:customerId/interactions")
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  @ApiOperation({ summary: "Log an interaction for a customer" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ type: InteractionResponseDto })
  create(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Body() dto: CreateInteractionDto,
    @Req() request: AuthRequest,
  ): Promise<InteractionResponseDto> {
    return this.interactionsService.create(customerId, dto, request.user!.id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get()
  @ApiOperation({ summary: "List customer interactions" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ type: PaginatedInteractionResponseDto })
  findAll(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Query() query: QueryInteractionDto,
    @Req() request: AuthRequest,
  ): Promise<PaginatedInteractionResponseDto> {
    return this.interactionsService.findAll(customerId, query, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a customer interaction" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  findOne(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<InteractionResponseDto> {
    return this.interactionsService.findOne(customerId, id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a customer interaction" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  update(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateInteractionDto,
    @Req() request: AuthRequest,
  ): Promise<InteractionResponseDto> {
    return this.interactionsService.update(customerId, id, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a customer interaction" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiNoContentResponse({ description: "Interaction removed" })
  remove(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<void> {
    return this.interactionsService.remove(customerId, id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
