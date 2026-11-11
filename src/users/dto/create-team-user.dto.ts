import { Transform } from "class-transformer";
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "src/entity/User";

export class CreateTeamUserDto {
  @ApiProperty({ format: "email", maxLength: 255 })
  @Transform(({ value }) =>
    typeof value === "string" ? value.trim().toLowerCase() : String(value),
  )
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({ minLength: 8, maxLength: 255 })
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

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ format: "uri", maxLength: 255 })
  @IsOptional()
  @IsUrl()
  @MaxLength(255)
  avatar?: string;
}
