import { Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateUserDto {
  @ApiProperty({ format: "email" })
  @Transform(({ value }): string =>
    typeof value === "string" ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ format: "password", minLength: 8, maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MinLength(8)
  @MaxLength(255)
  password: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(100)
  firstName: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(100)
  lastName: string;

  @ApiProperty({ maxLength: 255 })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  @MaxLength(255)
  companyName: string;

  @ApiProperty({ pattern: "^\\d{14}$", minLength: 14, maxLength: 14 })
  @IsString()
  @Matches(/^\d{14}$/)
  cnpj: string;

  @ApiPropertyOptional({ format: "uri", maxLength: 255 })
  @IsOptional()
  @IsString()
  @IsUrl()
  @MaxLength(255)
  avatar: string;
}
