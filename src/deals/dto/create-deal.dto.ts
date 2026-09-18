import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { DealStage } from "src/entity/Deal";

export class CreateDealDto {
  @IsUUID("4")
  customerId: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(255)
  title: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage: DealStage;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  probability: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  lostReason: string;
}
