
export interface userCreateDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  cnpj: string;
  avatar?: string
}

export interface userLoginDTO {
  email: string;
  password: string
}
