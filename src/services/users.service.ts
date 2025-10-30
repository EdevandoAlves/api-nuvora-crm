import { AppDataSource } from "../data-source";
import { userCreateDTO, userLoginDTO } from "../dtos/users.dto";
import { Organization } from "../entity/Organization";
import { User, UserRole } from "../entity/User";
import * as bcrypt from "bcrypt";
import { generateSlug } from "../helper/generateSlug";
import * as jwt from "jsonwebtoken";

export class UserService {
  private userRepo = AppDataSource.getRepository(User);
  private orgRepo = AppDataSource.getRepository(Organization);

  async createUser(data: userCreateDTO) {
    return AppDataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const orgRepo = manager.getRepository(Organization);

      const { email, password, firstName, lastName, companyName, cnpj } = data;

      const existingEmail = await userRepo.findOneBy({ email });
      if (existingEmail) {
        throw new Error("email is already in use");
      }

      const slug = generateSlug(companyName);
      const organization = orgRepo.create({ name: companyName, slug, cnpj });
      await orgRepo.save(organization);

      const passwordHashed = await bcrypt.hash(password, 10);

      const user = userRepo.create({ email, password: passwordHashed, firstName, lastName, organizationId: organization.id, role: UserRole.OWNER })
      await userRepo.save(user);

      organization.ownerId = user.id;
      await orgRepo.save(organization);

      return user;
    });
  }

  async userLogin(data: userLoginDTO) {
    const { email, password } = data;

    const user = await this.userRepo.findOneBy({ email });
    if (!user) {
      throw new Error("credentials not found");
    }

    if (user.isActive !== true) {
      throw new Error("credentials not found");
    }

    const organization = await this.orgRepo.findOneBy({ id: user.organizationId });
    if (organization.isActive !== true) {
      throw new Error("credentials not found");
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      throw new Error("credentials not found");
    }

    const payload = {
      id: user.id,
      organization: user.organizationId,
      role: user.role
    }

    const token = jwt.sign({ payload }, process.env.SECRET_KEY, { expiresIn: '1d' });

    return token
  }
}
