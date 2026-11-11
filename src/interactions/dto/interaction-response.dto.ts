import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { InteractionType } from "src/entity/Interaction";

export class InteractionResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  customerId: string;

  @ApiPropertyOptional({ nullable: true })
  contactId: string | null;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: InteractionType })
  type: InteractionType;

  @ApiPropertyOptional({ nullable: true })
  subject: string | null;

  @ApiProperty()
  description: string;

  @ApiPropertyOptional({ nullable: true })
  duration: number | null;

  @ApiPropertyOptional({ nullable: true })
  scheduledAt: Date | null;

  @ApiPropertyOptional({ nullable: true })
  completedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
