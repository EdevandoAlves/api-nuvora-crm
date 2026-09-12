import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  Min,
} from "class-validator";
import { CustomerStatus } from "src/entity/Customer";

export class CreateCustomerDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(255)
  companyName: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{14}$/)
  cnpj: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  industry: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  website: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  employeeCount: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualRevenue: number;

  @IsOptional()
  @IsObject()
  address: object;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  source: string;

  @IsOptional()
  @IsEnum(CustomerStatus)
  status: CustomerStatus;
}
