import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class DashboardTrendPointDto {
  @ApiProperty({ format: "date" })
  weekStart: string;

  @ApiProperty()
  won: number;

  @ApiProperty()
  lost: number;
}

export class QueryDashboardTrendDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 26, default: 8 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(26)
  weeks?: number;
}
