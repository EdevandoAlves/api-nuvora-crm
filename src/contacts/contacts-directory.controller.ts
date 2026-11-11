import { Controller, Get, Query, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { ContactsService } from "./contacts.service";
import { PaginatedContactResponseDto } from "./dto/paginated-contact-response.dto";
import { QueryContactDirectoryDto } from "./dto/query-contact-directory.dto";

@ApiTags("Contacts")
@ApiBearerAuth()
@Controller("contacts")
export class ContactsDirectoryController {
  constructor(private readonly contactsService: ContactsService) {}

  @Get()
  @ApiOperation({ summary: "List contacts across the organization" })
  @ApiOkResponse({ type: PaginatedContactResponseDto })
  findAll(
    @Query() query: QueryContactDirectoryDto,
    @Req() request: AuthRequest,
  ): Promise<PaginatedContactResponseDto> {
    return this.contactsService.listDirectory(query, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
