import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Min,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { InteractionType } from "src/entity/Interaction";

export class QueryInteractionDto {
  @ApiPropertyOptional({ enum: InteractionType })
  @IsOptional()
  @IsEnum(InteractionType)
  type?: InteractionType;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  contactId?: string;

  @ApiPropertyOptional({ format: "uuid" })
  @IsOptional()
  @IsUUID("4")
  userId?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ format: "date" })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ enum: ["ASC", "DESC"], default: "DESC" })
  @IsOptional()
  @IsIn(["ASC", "DESC"])
  sortOrder?: "ASC" | "DESC";
}
