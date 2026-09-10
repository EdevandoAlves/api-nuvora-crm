import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ format: "email" })
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  cnpj: string;

  @ApiPropertyOptional({ format: "uri" })
  avatar?: string;
}
