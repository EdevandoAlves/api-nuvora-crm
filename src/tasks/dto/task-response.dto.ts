import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TaskPriority, TaskStatus, TaskType } from "src/entity/Task";

export class TaskResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  customerId: string;

  @ApiPropertyOptional({ nullable: true })
  customerName: string | null;

  @ApiPropertyOptional({ nullable: true })
  dealId: string | null;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiProperty({ enum: TaskType })
  type: TaskType;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty({ format: "date" })
  dueDate: string;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiPropertyOptional({ nullable: true })
  completedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
