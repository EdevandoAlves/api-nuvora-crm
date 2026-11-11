import { ApiProperty } from "@nestjs/swagger";
import { InteractionResponseDto } from "./interaction-response.dto";

export class PaginatedInteractionResponseDto {
  @ApiProperty({ type: [InteractionResponseDto] })
  data: InteractionResponseDto[];

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
