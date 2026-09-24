import { OmitType, ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { DealStage } from "src/entity/Deal";
import { CreateDealDto } from "./create-deal.dto";

export class UpdateStageDealDto extends OmitType(CreateDealDto, [
  "customerId",
  "title",
  "value",
  "stage",
  "probability",
  "expectedCloseDate",
  "lostReason",
] as const) {
  @ApiProperty({ enum: DealStage })
  @IsEnum(DealStage)
  @IsNotEmpty()
  stage: DealStage;

  @ApiPropertyOptional({ maxLength: 255 })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  lostReason?: string;
}
