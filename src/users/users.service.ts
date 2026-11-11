import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AuthRequest } from "src/common/guards/jwt-auth.guard";
import { User } from "src/entity/User";
import { MeResponseDto } from "./dto/me-response.dto";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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
}
