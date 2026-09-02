import { PickType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

export class ForgotPasswordDto extends PickType(CreateUserDto, [
  "email",
] as const) {}
