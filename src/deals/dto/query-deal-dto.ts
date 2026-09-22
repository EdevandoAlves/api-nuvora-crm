import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { DealStage } from "src/entity/Deal";

export class QueryDealDTO {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ enum: DealStage })
  @IsOptional()
  @IsEnum(DealStage)
  stage?: DealStage;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsString()
  ownerId?: string;

  @ApiPropertyOptional({ format: "date", description: "YYYY-MM-DD" })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({ format: "date", description: "YYYY-MM-DD" })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ["value", "createdAt", "expectedCloseDate"],
    default: "createdAt",
  })
  @IsOptional()
  @IsIn(["value", "createdAt", "expectedCloseDate"])
  sortBy?: "value" | "createdAt" | "expectedCloseDate";

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}
