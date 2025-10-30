import { AppDataSource } from "../data-source";
import { userCreateDTO } from "../dtos/users.dto";
import { Organization } from "../entity/Organization";
import { User, UserRole } from "../entity/User";
import * as bcrypt from "bcrypt";
import { generateSlug } from "../helper/generateSlug";

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
}
