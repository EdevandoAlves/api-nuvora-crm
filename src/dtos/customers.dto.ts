
export interface CustomerBase {
  companyName?: string;
  cnpj?: string;
  industry?: string;
  website?: string;
  status?: string;
  source?: string;
  address?: string
}

export interface CustomerCreateDTO extends Required<Pick<CustomerBase, "companyName" | "cnpj">
> {
  industry?: string;
  website?: string;
  status?: string;
  source?: string;
  address?: string
}
