import { ConflictException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "src/entity/User";
import { DataSource, QueryFailedError, Repository } from "typeorm";
import { Organization } from "src/entity/Organization";
import { generateSlug } from "src/common/utils/generate-slug";
import * as bcrypt from "bcrypt";

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
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, companyName, cnpj } =
      createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const userRepo = manager.getRepository(User);
        const orgRepo = manager.getRepository(Organization);

        const userExists = await userRepo.findOneBy({ email });
        if (userExists) {
          throw new ConflictException(
            "Unable to create account with these details",
          );
        }
        const slug = generateSlug(companyName);
        if (!slug) {
          throw new ConflictException(
            "Company name cannot generate a valid slug",
          );
        }
        const orgExists = await orgRepo.findOne({
          where: [{ cnpj }, { slug }],
        });
        if (orgExists?.cnpj === cnpj) {
          throw new ConflictException(
            "Unable to create account with these details",
          );
        }
        if (orgExists?.slug === slug) {
          throw new ConflictException(
            "Unable to create account with these details",
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
        const { password: _, ...safeUser } = user;
        void _;

        org.ownerId = user.id;
        await orgRepo.save(org);

        return safeUser;
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException(
          "Unable to create account with these details",
        );
      }
      throw error;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
