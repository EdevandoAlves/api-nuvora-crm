import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { UserRole } from "src/entity/User";
import { CreateTeamUserDto } from "./dto/create-team-user.dto";
import { MeResponseDto } from "./dto/me-response.dto";
import { TeamUserResponseDto } from "./dto/team-user-response.dto";
import { UpdateTeamUserDto } from "./dto/update-team-user.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("me")
  @ApiOperation({ summary: "Get the authenticated user" })
  @ApiOkResponse({ type: MeResponseDto })
  @ApiUnauthorizedResponse({ description: "Missing or invalid JWT" })
  me(@Req() request: AuthRequest): Promise<MeResponseDto> {
    return this.usersService.getMe(request);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "List organization users" })
  @ApiOkResponse({ type: [TeamUserResponseDto] })
  list(@Req() request: AuthRequest): Promise<TeamUserResponseDto[]> {
    return this.usersService.list({
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Create an organization user" })
  @ApiOkResponse({ type: TeamUserResponseDto })
  create(
    @Body() dto: CreateTeamUserDto,
    @Req() request: AuthRequest,
  ): Promise<TeamUserResponseDto> {
    return this.usersService.create(dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: "Get an organization user by id" })
  @ApiParam({ name: "id", format: "uuid" })
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<TeamUserResponseDto> {
    return this.usersService.findOne(id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id")
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: "Update an organization user" })
  @ApiParam({ name: "id", format: "uuid" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateTeamUserDto,
    @Req() request: AuthRequest,
  ): Promise<TeamUserResponseDto> {
    return this.usersService.update(id, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
