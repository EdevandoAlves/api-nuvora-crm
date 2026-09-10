import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CustomerStatus } from "src/entity/Customer";

export class CustomerResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  companyName: string;

  @ApiPropertyOptional({ nullable: true })
  cnpj: string | null;

  @ApiPropertyOptional({ nullable: true })
  industry: string | null;

  @ApiPropertyOptional({ nullable: true })
  website: string | null;

  @ApiPropertyOptional({ nullable: true })
  employeeCount: number | null;

  @ApiPropertyOptional({ nullable: true })
  annualRevenue: number | null;

  @ApiPropertyOptional({ nullable: true })
  address: object | null;

  @ApiProperty({ enum: CustomerStatus })
  status: CustomerStatus;

  @ApiPropertyOptional({ nullable: true })
  source: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
