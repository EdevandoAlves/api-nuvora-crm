import { AppDataSource } from "../data-source";
import { OrgCreateDTO } from "../dtos/organizations.dto";
import { Organization } from "../entity/Organization";

export class OrganizationService {
  private orgRepo = AppDataSource.getRepository(Organization);

  async createOrganization(data: OrgCreateDTO) {
    const { name, slug, cnpj } = data;

    if (slug.length < 3) {
      throw new Error("Slug must be at least 3 char");
    }

    if (!/^\d{14}$/.test(cnpj)) {
      throw new Error("CNPJ must have 14 digits");
    }

    const existingSlug = await this.orgRepo.findOneBy({ slug });
    if (existingSlug) {
      throw new Error("Slug is already in use");
    }

    const existingCnpj = await this.orgRepo.findOneBy({ cnpj });
    if (existingCnpj) {
      throw new Error("CNPJ is already in use");
    }

    const organization = this.orgRepo.create({ name, slug, cnpj });
    await this.orgRepo.save(organization);

    return organization;
  }
}
