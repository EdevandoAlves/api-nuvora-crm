import { ApiProperty } from "@nestjs/swagger";
import { DealResponseDto } from "./deal-response.dto";

export class PaginatedDealResponseDTO {
  @ApiProperty({ type: [DealResponseDto] })
  data: DealResponseDto[];

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "number" },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
