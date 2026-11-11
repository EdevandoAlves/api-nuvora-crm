import { ApiProperty } from "@nestjs/swagger";
import { ContactResponseDto } from "./contact-response.dto";

export class PaginatedContactResponseDto {
  @ApiProperty({ type: [ContactResponseDto] })
  data: ContactResponseDto[];

  @ApiProperty({ type: "object", additionalProperties: { type: "number" } })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
