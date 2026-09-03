import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "src/entity/User";
import { DataSource, QueryFailedError, Repository } from "typeorm";
import { Organization } from "src/entity/Organization";
import { generateSlug } from "src/common/utils/generate-slug";
import { LoginDto } from "./dto/login.dto";
import { UserResponseDto } from "./dto/user-response.dto";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { ConfigService } from "@nestjs/config";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { MailerService } from "@nestjs-modules/mailer";
import { ResetPasswordDto } from "./dto/reset-password.dto";

function isUniqueViolation(error: unknown): boolean {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  const driverError: unknown = error.driverError;
  return (
    typeof driverError === "object" &&
    driverError !== null &&
    "code" in driverError &&
    driverError.code === "23505"
  );
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,

    @InjectDataSource()
    private readonly dataSource: DataSource,

    private readonly configService: ConfigService,

    private readonly mailerService: MailerService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, companyName, cnpj } =
      createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);

    const conflictMessage = "Unable to create account with these details"
    const slugMessage = "Company name cannot generate a valid slug"

    try {
      return await this.dataSource.transaction(async (manager) => {
        const userRepo = manager.getRepository(User);
        const orgRepo = manager.getRepository(Organization);

        const userExists = await userRepo.findOneBy({ email });
        if (userExists) {
          throw new ConflictException(
            conflictMessage,
          );
        }
        const slug = generateSlug(companyName);
        if (!slug) {
          throw new ConflictException(
            slugMessage,
          );
        }
        const orgExists = await orgRepo.findOne({
          where: [{ cnpj }, { slug }],
        });
        if (orgExists?.cnpj === cnpj) {
          throw new ConflictException(
            conflictMessage,
          );
        }
        if (orgExists?.slug === slug) {
          throw new ConflictException(
            conflictMessage,
          );
        }
        const org = orgRepo.create({ name: companyName, slug, cnpj });
        await orgRepo.save(org);

        const user = userRepo.create({
          email,
          password: passwordHash,
          firstName,
          lastName,
          organizationId: org.id,
          role: UserRole.ADMIN,
        });

        await userRepo.save(user);

        const userResponse = new UserResponseDto();
        userResponse.email = user.email;
        userResponse.firstName = user.firstName;
        userResponse.lastName = user.lastName;
        userResponse.companyName = org.name;
        userResponse.cnpj = org.cnpj;

        if (user.avatar) {
          userResponse.avatar = user.avatar;
        }

        org.ownerId = user.id;
        await orgRepo.save(org);

        return userResponse;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          conflictMessage
        );
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto): Promise<string> {
    const { email, password } = loginDto;

    const invalidMessage = "Invalid credentials"

    const user = await this.userRepo.findOneBy({ email });
    if (!user || user.isActive !== true) {
      throw new UnauthorizedException(invalidMessage);
    }

    const org = await this.orgRepo.findOneBy({ id: user.organizationId });
    if (org?.isActive !== true) {
      throw new UnauthorizedException(invalidMessage);
    }

    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
      throw new UnauthorizedException(invalidMessage);
    }

    interface jwtPayload {
      id: string;
      organization: string;
      role: string;
    }

    const payload: jwtPayload = {
      id: user.id,
      organization: user.organizationId,
      role: user.role,
    };

    const secret = this.configService.getOrThrow<string>("SECRET_KEY");

    const token = jwt.sign(payload, secret, {
      expiresIn: "1d",
    });
    return token;
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    const message =
      "If an account exists for this email, a reset link will be sent shortly.";
    const failedMessage = "Failed to send recovery email"

    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      return {
        message,
      };
    }

    const token = randomBytes(32).toString("hex");
    user.expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const tokenHash = createHash("sha256").update(token).digest("hex");
    user.resetToken = tokenHash;
    await this.userRepo.save(user);

    const resetLink = `${this.configService.getOrThrow<string>("FRONTEND_URI")}reset-link#token=${token}`;

    try {
      await this.mailerService.sendMail({
        to: email,
        subject: "Recuperar senha",
        html: `
      <h1> Recuperação de Senha </h1>
      <p> Você solicitou a recuperação de senha.</p>
      <p> Clique no link abaixo para redefinir sua senha: </p>
      <a href="${resetLink}"> Redefinir Senha </a>
      <p> Este link expira em 1 hora.</p>
      <p> Se você não solicitou isso, ignore este email.</p>
      `,
      });

      return { message };
    } catch (er) {
      console.error(failedMessage, er);
    }

    return { message };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    const successMessage = "Password reset successfully"
    const message =
      "Invalid or expired reset token";

    const queryToken = createHash("sha256").update(token).digest("hex");

    const user = await this.userRepo.findOne({
      where: { resetToken: queryToken },
    });
    if (!user || !user.expiresAt || user.expiresAt < new Date()) {
      throw new BadRequestException(message);
      ;
    }

    if (!user.isActive) {
      throw new BadRequestException(message);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (passwordMatch) {
      throw new BadRequestException(message);
    }

    const newPassword = await bcrypt.hash(password, 10);
    user.password = newPassword;
    user.expiresAt = null;
    user.resetToken = null;
    await this.userRepo.save(user);

    return { message: successMessage };
  }
}
