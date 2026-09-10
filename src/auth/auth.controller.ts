import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { LoginDto } from "./dto/login.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Throttle } from "@nestjs/throttler";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";

@ApiTags("Authentication")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register an organization owner" })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, type: UserResponseDto })
  register(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.authService.register(createUserDto);
  }

  @Public()
  @Post("login")
  @ApiOperation({ summary: "Authenticate and receive an access token" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: "JWT access token",
    schema: { type: "string" },
  })
  login(@Body() loginDto: LoginDto): Promise<string> {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post("forgot-password")
  @ApiOperation({ summary: "Request a password-reset email" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 201,
    schema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
  })
  @Throttle({
    default: {
      ttl: 60_000,
      limit: 3,
    },
  })
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post("reset-password")
  @ApiOperation({ summary: "Reset a password with a reset token" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 201,
    schema: {
      type: "object",
      properties: { message: { type: "string" } },
      required: ["message"],
    },
  })
  @Throttle({
    default: {
      ttl: 60_000,
      limit: 5,
    },
  })
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
