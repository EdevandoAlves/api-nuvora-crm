import { ApiProperty, PickType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsNotEmpty, IsString } from "class-validator";

export class ResetPasswordDto extends PickType(CreateUserDto, [
  "password",
] as const) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
