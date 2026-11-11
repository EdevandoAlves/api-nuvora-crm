import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InteractionType } from "src/entity/Interaction";

export class DashboardActivityCustomerDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  companyName: string;
}

export class DashboardActivityUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;
}

export class DashboardActivityItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: InteractionType })
  type: InteractionType;

  @ApiPropertyOptional({ nullable: true })
  subject: string | null;

  @ApiProperty()
  description: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: DashboardActivityCustomerDto })
  customer: DashboardActivityCustomerDto;

  @ApiPropertyOptional({
    type: DashboardActivityUserDto,
    nullable: true,
  })
  user: DashboardActivityUserDto | null;
}

export class QueryDashboardActivityDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
