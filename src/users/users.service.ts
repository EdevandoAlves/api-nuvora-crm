import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { Repository } from "typeorm";
import type { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { TenantContext } from "src/common/utils/tenant-context";
import { isUniqueViolation } from "src/common/utils/typeorm-errors";
import { Organization } from "src/entity/Organization";
import { User, UserRole } from "src/entity/User";
import { CreateTeamUserDto } from "./dto/create-team-user.dto";
import { MeResponseDto } from "./dto/me-response.dto";
import { TeamUserResponseDto } from "./dto/team-user-response.dto";
import { UpdateTeamUserDto } from "./dto/update-team-user.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  private toTeamResponseDto(user: User): TeamUserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar ?? null,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt ?? null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private assertCanManageRole(actorRole: UserRole, targetRole: UserRole): void {
    if (targetRole === UserRole.OWNER && actorRole !== UserRole.OWNER) {
      throw new ForbiddenException("Only an owner can manage owners");
    }
    if (targetRole === UserRole.ADMIN && actorRole !== UserRole.OWNER) {
      throw new ForbiddenException("Only an owner can manage admins");
    }
  }

  async getMe({ user }: AuthRequest): Promise<MeResponseDto> {
    if (!user?.id) {
      throw new UnauthorizedException("Authentication required");
    }

    const found = await this.userRepo.findOne({
      where: { id: user.id },
      relations: { organization: true },
    });

    if (!found || !found.isActive || !found.organization?.isActive) {
      throw new UnauthorizedException("Authentication required");
    }

    return {
      id: found.id,
      email: found.email,
      firstName: found.firstName,
      lastName: found.lastName,
      role: found.role,
      organizationId: found.organizationId,
      organization: {
        id: found.organization.id,
        name: found.organization.name,
        slug: found.organization.slug,
        cnpj: found.organization.cnpj,
        plan: found.organization.plan,
        isActive: found.organization.isActive,
      },
      avatar: found.avatar ?? null,
      isActive: found.isActive,
      lastLoginAt: found.lastLoginAt ?? null,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    };
  }

  async list({
    organizationId,
  }: TenantContext): Promise<TeamUserResponseDto[]> {
    const users = await this.userRepo.find({
      where: { organizationId },
      order: { createdAt: "ASC" },
    });
    return users.map((user) => this.toTeamResponseDto(user));
  }

  async findOne(
    id: string,
    { organizationId }: TenantContext,
  ): Promise<TeamUserResponseDto> {
    const user = await this.userRepo.findOne({
      where: { id, organizationId },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return this.toTeamResponseDto(user);
  }

  async create(
    dto: CreateTeamUserDto,
    ctx: TenantContext,
  ): Promise<TeamUserResponseDto> {
    this.assertCanManageRole(ctx.role, dto.role);

    const organization = await this.orgRepo.findOneBy({
      id: ctx.organizationId,
    });
    if (!organization || !organization.isActive) {
      throw new UnauthorizedException("Organization is not active");
    }

    const count = await this.userRepo.count({
      where: { organizationId: ctx.organizationId },
    });
    if (organization.maxUsers > 0 && count >= organization.maxUsers) {
      throw new BadRequestException("Organization user limit reached");
    }

    const email = dto.email.trim().toLowerCase();
    const existing = await this.userRepo.findOneBy({ email });
    if (existing) {
      throw new ConflictException("Unable to create user with these details");
    }

    const user = this.userRepo.create({
      organizationId: ctx.organizationId,
      email,
      password: await bcrypt.hash(dto.password, 12),
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role,
      avatar: dto.avatar,
      isActive: true,
    });

    try {
      await this.userRepo.save(user);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException("Unable to create user with these details");
      }
      throw error;
    }

    return this.toTeamResponseDto(user);
  }

  async update(
    id: string,
    dto: UpdateTeamUserDto,
    ctx: TenantContext,
  ): Promise<TeamUserResponseDto> {
    const target = await this.userRepo.findOne({
      where: { id, organizationId: ctx.organizationId },
    });
    if (!target) {
      throw new NotFoundException("User not found");
    }

    if (target.role === UserRole.OWNER && ctx.role !== UserRole.OWNER) {
      throw new ForbiddenException("Only an owner can manage owners");
    }
    if (dto.role !== undefined) {
      this.assertCanManageRole(ctx.role, dto.role);
    }

    if (target.id === ctx.ownerId) {
      if (dto.role !== undefined && dto.role !== target.role) {
        throw new BadRequestException("Cannot change your own role");
      }
      if (dto.isActive === false) {
        throw new BadRequestException("Cannot deactivate yourself");
      }
    }

    const removesOwner =
      target.role === UserRole.OWNER &&
      (dto.role !== undefined && dto.role !== UserRole.OWNER
        ? true
        : dto.isActive === false);

    if (removesOwner) {
      const owners = await this.userRepo.count({
        where: {
          organizationId: ctx.organizationId,
          role: UserRole.OWNER,
          isActive: true,
        },
      });
      if (owners <= 1) {
        throw new BadRequestException(
          "Organization must keep at least one active owner",
        );
      }
    }

    if (dto.firstName !== undefined) target.firstName = dto.firstName;
    if (dto.lastName !== undefined) target.lastName = dto.lastName;
    if (dto.role !== undefined) target.role = dto.role;
    if (dto.isActive !== undefined) target.isActive = dto.isActive;
    if (dto.avatar !== undefined) target.avatar = dto.avatar;

    await this.userRepo.save(target);
    return this.toTeamResponseDto(target);
  }
}
