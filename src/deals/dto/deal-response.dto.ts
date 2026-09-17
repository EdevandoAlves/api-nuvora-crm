import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { DealStage } from "src/entity/Deal";

export class DealResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  value: number;

  @ApiProperty({ enum: DealStage })
  stage: DealStage;

  @ApiProperty()
  probability: number;

  @ApiPropertyOptional({ nullable: true })
  expectedCloseDate: Date | null;

  @ApiPropertyOptional({ nullable: true })
  lostReason: string | null;

  @ApiPropertyOptional({ nullable: true })
  closedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
