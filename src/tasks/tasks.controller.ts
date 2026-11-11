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
import { CreateTaskDto } from "./dto/create-task.dto";
import { PaginatedTaskResponseDto } from "./dto/paginated-task-response.dto";
import { QueryTaskDto } from "./dto/query-task.dto";
import { TaskResponseDto } from "./dto/task-response.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { UpdateTaskStatusDto } from "./dto/update-task-status.dto";
import { TasksService } from "./tasks.service";

@ApiTags("Tasks")
@ApiBearerAuth()
@Controller("tasks")
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: "Create a task" })
  @ApiOkResponse({ type: TaskResponseDto })
  create(
    @Body() dto: CreateTaskDto,
    @Req() request: AuthRequest,
  ): Promise<TaskResponseDto> {
    return this.tasksService.create(dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get()
  @ApiOperation({ summary: "List tasks" })
  @ApiOkResponse({ type: PaginatedTaskResponseDto })
  findAll(
    @Query() query: QueryTaskDto,
    @Req() request: AuthRequest,
  ): Promise<PaginatedTaskResponseDto> {
    return this.tasksService.findAll(query, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a task by id" })
  @ApiParam({ name: "id", format: "uuid" })
  findOne(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<TaskResponseDto> {
    return this.tasksService.findOne(id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a task" })
  @ApiParam({ name: "id", format: "uuid" })
  update(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateTaskDto,
    @Req() request: AuthRequest,
  ): Promise<TaskResponseDto> {
    return this.tasksService.update(id, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Patch(":id/status")
  @ApiOperation({ summary: "Update a task status" })
  @ApiParam({ name: "id", format: "uuid" })
  updateStatus(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Body() dto: UpdateTaskStatusDto,
    @Req() request: AuthRequest,
  ): Promise<TaskResponseDto> {
    return this.tasksService.updateStatus(id, dto, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Remove a task" })
  @ApiParam({ name: "id", format: "uuid" })
  @ApiNoContentResponse({ description: "Task removed" })
  remove(
    @Param("id", new ParseUUIDPipe({ version: "4" })) id: string,
    @Req() request: AuthRequest,
  ): Promise<void> {
    return this.tasksService.remove(id, {
      ownerId: request.user!.id,
      organizationId: request.user!.organization,
      role: request.user!.role,
    });
  }
}
