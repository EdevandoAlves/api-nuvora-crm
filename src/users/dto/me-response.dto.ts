import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PlanType } from "src/entity/Organization";
import { UserRole } from "src/entity/User";

export class MeOrganizationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  cnpj: string;

  @ApiProperty({ enum: PlanType })
  plan: PlanType;

  @ApiProperty()
  isActive: boolean;
}

export class MeResponseDto {
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

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ type: MeOrganizationDto })
  organization: MeOrganizationDto;

  @ApiPropertyOptional({ format: "uri", nullable: true })
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
