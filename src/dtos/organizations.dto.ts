import { UserRole } from "../entity/User";

export interface OrgCreateDTO {
  name: string;
  slug: string;
  cnpj: string;
}

export interface tokenDTO {
  id: string;
  organization: string;
}

