import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { DealStage } from "src/entity/Deal";

export class QueryDealDTO {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  ownerId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsIn(["value", "createdAt", "expectedCloseDate"])
  sortBy?: "value" | "createdAt" | "expectedCloseDate";

  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}
