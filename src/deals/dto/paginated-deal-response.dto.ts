import { DealResponseDto } from "./deal-response.dto";

export class PaginatedDealResponseDTO {
  data: DealResponseDto[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
