import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { UserRole } from "src/entity/User";

export class TeamUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ format: "email" })
  email: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiPropertyOptional({ nullable: true })
  avatar: string | null;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional({ nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
