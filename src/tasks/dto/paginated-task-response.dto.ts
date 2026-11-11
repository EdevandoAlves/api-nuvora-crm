import { ApiProperty } from "@nestjs/swagger";
import { TaskResponseDto } from "./task-response.dto";

export class PaginatedTaskResponseDto {
  @ApiProperty({ type: [TaskResponseDto] })
  data: TaskResponseDto[];

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
