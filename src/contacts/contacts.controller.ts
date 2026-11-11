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
import { ContactsService } from "./contacts.service";
import { ContactResponseDto } from "./dto/contact-response.dto";
import { CreateContactDto } from "./dto/create-contact.dto";
import { UpdateContactDto } from "./dto/update-contact.dto";

@ApiTags("Contacts")
@ApiBearerAuth()
@Controller("customers/:customerId/contacts")
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @ApiOperation({ summary: "Create a contact for a customer" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiOkResponse({ type: ContactResponseDto })
  create(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Body() dto: CreateContactDto,
    @Req() request: AuthRequest,
  ): Promise<ContactResponseDto> {
    return this.contactsService.create(customerId, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get()
  @ApiOperation({ summary: "List contacts for a customer" })
  @ApiParam({ name: "customerId", format: "uuid" })
  findAll(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Req() request: AuthRequest,
  ): Promise<ContactResponseDto[]> {
    return this.contactsService.findAll(customerId, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a contact by id" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  findOne(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<ContactResponseDto> {
    return this.contactsService.findOne(customerId, id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a contact" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  update(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateContactDto,
    @Req() request: AuthRequest,
  ): Promise<ContactResponseDto> {
    return this.contactsService.update(customerId, id, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a contact" })
  @ApiParam({ name: "customerId", format: "uuid" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiNoContentResponse({ description: "Contact removed" })
  remove(
    @Param("customerId", new ParseUUIDPipe({ version: "4" }))
    customerId: string,
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<void> {
    return this.contactsService.remove(customerId, id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
