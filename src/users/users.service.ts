import { ConflictException, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { User, UserRole } from "src/entity/User";
import { DataSource, Repository } from "typeorm";
import { Organization } from "src/entity/Organization";
import { generateSlug } from "src/common/utils/generate-slug";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,

    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { email, password, firstName, lastName, companyName, cnpj } =
      createUserDto;
    const passwordHash = await bcrypt.hash(password, 12);

    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const orgRepo = manager.getRepository(Organization);

      const userExists = await userRepo.findOneBy({ email });
      if (userExists) {
        throw new ConflictException("Email already registered");
      }

      const slug = generateSlug(companyName);
      const orgExists = await orgRepo.findOne({ where: [{ cnpj }, { slug }] });
      if (orgExists?.cnpj === cnpj) {
        throw new ConflictException("CNPJ already registered");
      }
      if (orgExists?.slug === slug) {
        throw new ConflictException("SLUG already registered");
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

      org.ownerId = user.id;
      await orgRepo.save(org);

      return safeUser;
    });
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
