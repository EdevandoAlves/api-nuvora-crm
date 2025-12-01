import { AppDataSource } from "../data-source";
import { tokenDTO, OrgCreateDTO } from "../dtos/organizations.dto";
import { Organization } from "../entity/Organization";
import { User } from "../entity/User";

export class OrganizationService {
  private orgRepo = AppDataSource.getRepository(Organization);
  private userRepo = AppDataSource.getRepository(User)

  async createOrganization(data: OrgCreateDTO) {
    const { name, slug, cnpj } = data;

    if (slug.length < 3) {
      throw { status: 401, message: "Slug must be at least 3 char" };
    }

    if (!/^\d{14}$/.test(cnpj)) {
      throw { status: 401, message: "CNPJ must have 14 digits" };
    }

    const existingSlug = await this.orgRepo.findOneBy({ slug });
    if (existingSlug) {
      throw { status: 401, message: "Slug is already in use" };
    }

    const existingCnpj = await this.orgRepo.findOneBy({ cnpj });
    if (existingCnpj) {
      throw { status: 401, message: "CNPJ is already in use" };
    }

    const organization = this.orgRepo.create({ name, slug, cnpj });
    await this.orgRepo.save(organization);

    return organization;
  }

  async orgSettings(data: tokenDTO): Promise<Pick<Organization, "id" | "name" | "cnpj" | "plan">> {
    const { id, organization } = data;

    const user = await this.userRepo.findOneBy({ id })
    if (!user || user.isActive === false) {
      throw { status: 401, message: "User not found" };
    }

    const org = await this.orgRepo.findOneBy({ id: organization })
    if (!org || org.isActive === false) {
      throw { status: 401, message: "Organization not found" };
    }

    return {
      id: org.id,
      name: org.name,
      cnpj: org.cnpj,
      plan: org.plan
    } satisfies Pick<Organization, "id" | "name" | "cnpj" | "plan">;
  }
}
