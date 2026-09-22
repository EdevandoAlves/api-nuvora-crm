import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { CustomerResponseDto } from "./dto/customer-response.dto";

@ApiTags("Customers")
@ApiBearerAuth()
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: "Create a customer for the organization" })
  create(
    @Body() createCustomerDto: CreateCustomerDto,
    @Req() request: AuthRequest,
  ): Promise<CustomerResponseDto> {
    return this.customersService.create(createCustomerDto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get()
  @ApiOperation({ summary: "List customers for the organization" })
  findAll(@Req() request: AuthRequest): Promise<CustomerResponseDto[]> {
    return this.customersService.findAll({
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a customer by id" })
  @ApiParam({ name: "id", format: "uuid" })
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<CustomerResponseDto> {
    return this.customersService.findOne(id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a customer" })
  @ApiParam({ name: "id", format: "uuid" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @Req() request: AuthRequest,
  ): Promise<CustomerResponseDto> {
    return this.customersService.update(id, updateCustomerDto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Delete(":id")
  @ApiOperation({ summary: "Remove a customer" })
  @ApiParam({ name: "id", format: "uuid" })
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<void> {
    return this.customersService.remove(id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
