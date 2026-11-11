import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DealProductResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dealId: string;

  @ApiProperty()
  productId: string;

  @ApiPropertyOptional({ nullable: true })
  productName: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  discount: number;

  @ApiProperty()
  totalPrice: number;
}
