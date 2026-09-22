import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CustomerStatus } from "src/entity/Customer";

export class CreateCustomerDto {
  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(255)
  companyName: string;

  @ApiPropertyOptional({ pattern: "^\\d{14}$", minLength: 14, maxLength: 14 })
  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/)
  cnpj: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry: string;

  @ApiPropertyOptional({ format: "uri", maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  website: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  employeeCount: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRevenue: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  address: object;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  source: string;

  @ApiPropertyOptional({ enum: CustomerStatus })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status: CustomerStatus;
}
